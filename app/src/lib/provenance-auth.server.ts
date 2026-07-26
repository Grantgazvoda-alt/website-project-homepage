// Provenance Auth System -- JWT-based auth + API key management + rate limiting
import { z } from "zod";
import type { D1Database } from "@cloudflare/workers-types";

const JWT_SECRET = "provenance-jwt-v1";
const AUTH_COOKIE = "provenance_token";

// ─── Password Hashing (PBKDF2) ───

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, "0")).join("");
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const hashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  return { hash: Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join(""), salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const saltBytes = new Uint8Array(salt.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const hashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("") === hash;
}

// ─── JWT ───

export function generateId(): string { return crypto.randomUUID(); }

export interface JwtPayload { sub: string; email: string; role: string; iat: number; exp: number; }

function b64(input: string): string { return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }

export async function signJwt(payload: { sub: string; email: string; role: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const full: JwtPayload = { ...payload, iat: now, exp: now + 7 * 86400 };
  const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadB64 = b64(JSON.stringify(full));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = b64(Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payloadB64}`)))).map(b => String.fromCharCode(b)).join(""));
  return `${header}.${payloadB64}.${sig}`;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sig = new Uint8Array(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")).split("").map(c => c.charCodeAt(0)));
    if (!await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(`${parts[0]}.${parts[1]}`))) return null;
    const payload: JwtPayload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

// ─── API Key Management ───

export async function createApiKey(userId: string, name: string, role: string, scopes = "read"): Promise<{ key: string; id: string; scopes: string }> {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const key = `pv_${generateId().replace(/-/g, "")}${generateId().replace(/-/g, "").slice(0, 16)}`;
  const hashed = await hashPassword(key);
  const id = generateId();
  await database.prepare(
    "INSERT INTO provenance_api_keys (id, user_id, name, key_hash, key_salt, role, scopes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))"
  ).bind(id, userId, name, hashed.hash, hashed.salt, role, scopes).run();
  return { key, id, scopes };
}

export async function validateApiKey(key: string): Promise<{ userId: string; role: string; id: string; scopes: string } | null> {
  const database = await db();
  if (!database) return null;
  const rows = await database.prepare("SELECT * FROM provenance_api_keys").all();
  for (const row of rows.results ?? []) {
    const r = row as any;
    if (await verifyPassword(key, r.key_hash, r.key_salt)) {
      return { userId: r.user_id, role: r.role, id: r.id, scopes: r.scopes ?? "read" };
    }
  }
  return null;
}

export async function listApiKeys(userId: string): Promise<any[]> {
  const database = await db();
  if (!database) return [];
  const result = await database.prepare("SELECT id, user_id, name, role, scopes, last_used_at, created_at FROM provenance_api_keys WHERE user_id = ?").bind(userId).all();
  return result.results ?? [];
}

export async function deleteApiKey(id: string, actorId = "system"): Promise<void> {
  const database = await db();
  if (!database) return;
  const old = await database.prepare("SELECT name, scopes FROM provenance_api_keys WHERE id = ?").bind(id).first<{ name: string; scopes: string }>();
  await database.prepare("DELETE FROM provenance_api_keys WHERE id = ?").bind(id).run();
  if (old) {
    await logAuditEvent(actorId, "key_delete", "api_key", id, old.scopes, "", JSON.stringify({ key_name: old.name }));
  }
}

// ─── Scope Management ───

export async function updateApiKeyScope(keyId: string, newScopes: string, actorId = "system"): Promise<void> {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const validScopes = ["read", "write", "admin"];
  if (!validScopes.includes(newScopes)) throw new Error("Invalid scope. Must be: read, write, or admin");
  // Get the old scope for audit logging
  const old = await database.prepare("SELECT scopes, name FROM provenance_api_keys WHERE id = ?").bind(keyId).first<{ scopes: string; name: string }>();
  if (!old) throw new Error("API key not found");
  await database.prepare("UPDATE provenance_api_keys SET scopes = ? WHERE id = ?").bind(newScopes, keyId).run();
  // Log the scope change
  await logAuditEvent(actorId, "scope_update", "api_key", keyId, old.scopes, newScopes, JSON.stringify({ key_name: old.name }));
}

export async function listApiKeysByScope(scope: string): Promise<any[]> {
  const database = await db();
  if (!database) return [];
  const result = await database.prepare("SELECT id, user_id, name, role, scopes, last_used_at, created_at FROM provenance_api_keys WHERE scopes = ? ORDER BY created_at DESC").bind(scope).all();
  return result.results ?? [];
}

// ─── Audit Logging ───

export async function logAuditEvent(actorId: string, action: string, targetType: string, targetId: string, oldValue?: string, newValue?: string, metadata?: string): Promise<void> {
  const database = await db();
  if (!database) return;
  const id = generateId();
  await database.prepare(
    "INSERT INTO provenance_audit_log (id, actor_id, action, target_type, target_id, old_value, new_value, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, actorId, action, targetType, targetId, oldValue ?? "", newValue ?? "", metadata ?? "").run();
}

export async function listAuditLogs(targetType?: string, targetId?: string, limit = 50, offset = 0): Promise<any[]> {
  const database = await db();
  if (!database) return [];
  let query = "SELECT * FROM provenance_audit_log";
  const params: string[] = [];
  const conditions: string[] = [];
  if (targetType) { conditions.push("target_type = ?"); params.push(targetType); }
  if (targetId) { conditions.push("target_id = ?"); params.push(targetId); }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(String(limit), String(offset));
  const result = await database.prepare(query).bind(...params).all();
  return result.results ?? [];
}

// ─── Rate Limiting ───

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 100, windowMs = 60000): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// ─── Auth middleware ───

export async function authenticateRequest(request: Request): Promise<{ userId: string; role: string; authenticated: boolean; error?: string }> {
  // Check Authorization header
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    // Try JWT first
    const jwt = await verifyJwt(token);
    if (jwt) return { userId: jwt.sub, role: jwt.role, authenticated: true };
    // Try API key
    const apiKey = await validateApiKey(token);
    if (apiKey) return { userId: apiKey.userId, role: apiKey.role, authenticated: true };
  }

  // Check cookie
  const cookie = request.headers.get("Cookie") || "";
  const cookieMatch = cookie.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`));
  if (cookieMatch) {
    const jwt = await verifyJwt(cookieMatch[1]);
    if (jwt) return { userId: jwt.sub, role: jwt.role, authenticated: true };
  }

  // Allow read-only access without auth in dev
  if (import.meta.env.DEV) return { userId: "dev-user", role: "admin", authenticated: true };

  return { userId: "", role: "", authenticated: false, error: "Authentication required" };
}

async function db(): Promise<D1Database | null> {
  try {
    const { bindings } = await import("./bindings.server");
    const database = bindings().DB;
    if (database) return database;
  } catch (e) { if (!import.meta.env.DEV) throw e; }
  if (import.meta.env.DEV) return null;
  throw new Error("Database not available");
}

// ─── User Management ───

export const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1).max(100) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string() });

export async function registerUser(email: string, password: string, name: string) {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const existing = await database.prepare("SELECT id FROM provenance_users WHERE email = ?").bind(email.toLowerCase()).first();
  if (existing) throw new Error("Email already registered");
  const id = generateId();
  const { hash, salt } = await hashPassword(password);
  await database.prepare("INSERT INTO provenance_users (id, email, name, password_hash, password_salt) VALUES (?, ?, ?, ?, ?)").bind(id, email.toLowerCase(), name, hash, salt).run();
  const token = await signJwt({ sub: id, email: email.toLowerCase(), role: "user" });
  return { token, user: { id, email: email.toLowerCase(), name } };
}

export async function loginUser(email: string, password: string) {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const user = await database.prepare("SELECT * FROM provenance_users WHERE email = ?").bind(email.toLowerCase()).first<{ id: string; email: string; name: string; password_hash: string; password_salt: string }>();
  if (!user) throw new Error("Invalid email or password");
  if (!await verifyPassword(password, user.password_hash, user.password_salt)) throw new Error("Invalid email or password");
  const token = await signJwt({ sub: user.id, email: user.email, role: "user" });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}
