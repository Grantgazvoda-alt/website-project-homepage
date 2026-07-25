// Provenance Intelligence System — Core Server Data Layer
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { z } from "zod";

async function db(): Promise<D1Database | null> {
  try {
    const { bindings } = await import("../lib/bindings.server");
    const database = bindings().DB;
    if (database) return database;
  } catch (e) { if (!import.meta.env.DEV) throw e; }
  if (import.meta.env.DEV) return null;
  throw new Error("Database not available");
}

// ─── Record Schemas ───

export const lineageEntrySchema = z.object({
  agent_id: z.string().min(1),
  file_path: z.string().optional().default(""),
  file_language: z.string().optional().default(""),
  reasoning: z.string().optional().default(""),
  model_used: z.string().optional().default(""),
  prompt_snapshot: z.string().optional().default(""),
  content_hash: z.string().optional().default(""),
  duration_ms: z.number().int().optional().default(0),
  retry_count: z.number().int().optional().default(0),
  error_message: z.string().optional().default(""),
});

export const recordSchema = z.object({
  source_project: z.enum(["stackforge", "gummy-bear"]),
  source_project_id: z.string().min(1),
  user_id: z.string().min(1),
  brief: z.string().min(1),
  architecture_plan: z.string().optional(),
  tech_stack: z.string().optional(),
  version_number: z.number().int().optional(),
  file_count: z.number().int().optional(),
  total_lines: z.number().int().optional(),
  commit_hash: z.string().optional(),
  commit_message: z.string().optional(),
  repo_url: z.string().optional(),
  repo_name: z.string().optional(),
  pipeline_duration_ms: z.number().int().optional(),
  model_used: z.string().optional(),
  fix_rounds: z.number().int().optional(),
  build_status: z.enum(["pending", "passed", "failed", "not_run"]).optional(),
  test_status: z.enum(["pending", "passed", "failed", "not_run"]).optional(),
  lineage: z.array(lineageEntrySchema).optional().default([]),
});

// ─── Records ───

export async function createRecord(data: z.infer<typeof recordSchema>) {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const id = crypto.randomUUID();
  await database.prepare(
    `INSERT INTO provenance_records (id, source_project, source_project_id, user_id, brief, architecture_plan, tech_stack, version_number, file_count, total_lines, commit_hash, commit_message, repo_url, repo_name, pipeline_duration_ms, model_used, fix_rounds, build_status, test_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, data.source_project, data.source_project_id, data.user_id, data.brief,
    data.architecture_plan ?? "", data.tech_stack ?? "", data.version_number ?? 0,
    data.file_count ?? 0, data.total_lines ?? 0, data.commit_hash ?? "",
    data.commit_message ?? "", data.repo_url ?? "", data.repo_name ?? "",
    data.pipeline_duration_ms ?? 0, data.model_used ?? "", data.fix_rounds ?? 0,
    data.build_status ?? "not_run", data.test_status ?? "not_run"
  ).run();
  for (const entry of data.lineage) {
    const lineageId = crypto.randomUUID();
    await database.prepare(
      `INSERT INTO provenance_lineage (id, provenance_id, agent_id, file_path, file_language, reasoning, model_used, prompt_snapshot, content_hash, duration_ms, retry_count, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      lineageId, id, entry.agent_id, entry.file_path, entry.file_language,
      entry.reasoning, entry.model_used, entry.prompt_snapshot, entry.content_hash,
      entry.duration_ms, entry.retry_count, entry.error_message
    ).run();
  }
  return { id, status: "created" };
}

export async function listRecords(source?: string, limit = 50, offset = 0) {
  const database = await db();
  if (!database) return { data: [], total: 0, limit, offset };
  let query = "SELECT * FROM provenance_records";
  const params: string[] = [];
  if (source) { query += " WHERE source_project = ?"; params.push(source); }
  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(String(limit), String(offset));
  const result = await database.prepare(query).bind(...params).all();
  const countResult = await (source
    ? database.prepare("SELECT COUNT(*) as total FROM provenance_records WHERE source_project = ?").bind(source)
    : database.prepare("SELECT COUNT(*) as total FROM provenance_records")
  ).first<{ total: number }>();
  return { data: result.results, total: countResult?.total ?? 0, limit, offset };
}

export async function getRecord(id: string) {
  const database = await db();
  if (!database) return null;
  const record = await database.prepare("SELECT * FROM provenance_records WHERE id = ?").bind(id).first();
  if (!record) return null;
  const lineage = await database.prepare("SELECT * FROM provenance_lineage WHERE provenance_id = ? ORDER BY created_at ASC").bind(id).all();
  const deployments = await database.prepare("SELECT * FROM provenance_deployments WHERE provenance_id = ? ORDER BY created_at DESC").bind(id).all();
  const certificate = await database.prepare("SELECT * FROM provenance_certificates WHERE provenance_id = ?").bind(id).first();
  return { ...record, lineage: lineage.results, deployments: deployments.results, certificate };
}

export async function deleteRecord(id: string) {
  const database = await db();
  if (!database) throw new Error("Database not available");
  await database.prepare("DELETE FROM provenance_records WHERE id = ?").bind(id).run();
  return { id, status: "deleted" };
}

// ─── Lineage ───

export async function traceLineage(contentHash: string) {
  const database = await db();
  if (!database) return null;
  const entries = await database.prepare(
    "SELECT l.*, r.source_project, r.source_project_id, r.brief, r.architecture_plan, r.tech_stack, r.created_at as record_created_at FROM provenance_lineage l JOIN provenance_records r ON l.provenance_id = r.id WHERE l.content_hash = ? ORDER BY l.created_at DESC"
  ).bind(contentHash).all();
  return entries.results;
}

export async function traceByFile(filePath: string, repoName?: string) {
  const database = await db();
  if (!database) return null;
  let query = "SELECT l.*, r.source_project, r.source_project_id, r.brief, r.architecture_plan, r.created_at as record_created_at FROM provenance_lineage l JOIN provenance_records r ON l.provenance_id = r.id WHERE l.file_path LIKE ?";
  const params: string[] = [`%${filePath}%`];
  if (repoName) { query += " AND r.repo_name = ?"; params.push(repoName); }
  query += " ORDER BY l.created_at DESC LIMIT 20";
  const result = await database.prepare(query).bind(...params).all();
  return result.results;
}

// ─── Deployments ───

export async function createDeployment(data: { provenance_id: string; environment: string; provider: string; live_url?: string; branch?: string; deployed_by?: string }) {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const id = crypto.randomUUID();
  await database.prepare(
    `INSERT INTO provenance_deployments (id, provenance_id, environment, provider, status, live_url, branch, deployed_by, deployed_at)
     VALUES (?, ?, ?, ?, 'deploying', ?, ?, ?, datetime('now'))`
  ).bind(id, data.provenance_id, data.environment, data.provider, data.live_url ?? "", data.branch ?? "main", data.deployed_by ?? "").run();
  return { id, status: "deploying" };
}

export async function listDeployments(environment?: string, provider?: string, limit = 50, offset = 0) {
  const database = await db();
  if (!database) return { data: [], total: 0, limit, offset };
  let query = "SELECT * FROM provenance_deployments";
  const params: string[] = [];
  const conditions: string[] = [];
  if (environment) { conditions.push("environment = ?"); params.push(environment); }
  if (provider) { conditions.push("provider = ?"); params.push(provider); }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(String(limit), String(offset));
  const result = await database.prepare(query).bind(...params).all();
  return { data: result.results, total: 0, limit, offset };
}

export async function updateDeploymentStatus(id: string, status: string, liveUrl?: string) {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const params: (string | number)[] = [status];
  let query = "UPDATE provenance_deployments SET status = ?";
  if (liveUrl !== undefined) { query += ", live_url = ?"; params.push(liveUrl); }
  query += " WHERE id = ?";
  params.push(id);
  await database.prepare(query).bind(...params).run();
  return { id, status };
}

// ─── Rollbacks ───

export async function rollbackDeployment(deploymentId: string, reason: string, triggeredBy = "manual") {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const deployment = await database.prepare("SELECT * FROM provenance_deployments WHERE id = ?").bind(deploymentId).first<{ provenance_id: string }>();
  if (!deployment) throw new Error("Deployment not found");
  const rollbackId = crypto.randomUUID();
  await database.prepare(
    "INSERT INTO provenance_rollbacks (id, deployment_id, reason, triggered_by) VALUES (?, ?, ?, ?)"
  ).bind(rollbackId, deploymentId, reason, triggeredBy).run();
  await database.prepare("UPDATE provenance_deployments SET status = 'rolled_back' WHERE id = ?").bind(deploymentId).run();
  return { id: rollbackId, status: "rolled_back" };
}

export async function listRollbacks(deploymentId: string) {
  const database = await db();
  if (!database) return [];
  const result = await database.prepare("SELECT * FROM provenance_rollbacks WHERE deployment_id = ? ORDER BY created_at DESC").bind(deploymentId).all();
  return result.results;
}

// ─── Certificates ───

export async function generateCertificate(provenanceId: string) {
  const database = await db();
  if (!database) throw new Error("Database not available");
  const record = await database.prepare("SELECT * FROM provenance_records WHERE id = ?").bind(provenanceId).first<{ brief: string; commit_hash: string }>();
  if (!record) throw new Error("Record not found");
  const id = crypto.randomUUID();
  const certData = JSON.stringify({
    provenance_id: provenanceId,
    brief_hash: await sha256(record.brief ?? ""),
    commit_hash: record.commit_hash ?? "",
    timestamp: new Date().toISOString(),
    signature: "provenance-v1-hmac-placeholder",
  });
  await database.prepare(
    "INSERT INTO provenance_certificates (id, provenance_id, certificate_data, valid_from) VALUES (?, ?, ?, datetime('now'))"
  ).bind(id, provenanceId, certData).run();
  return { id, certificate_data: certData };
}

export async function verifyCertificate(id: string) {
  const database = await db();
  if (!database) return null;
  const cert = await database.prepare("SELECT * FROM provenance_certificates WHERE id = ?").bind(id).first();
  if (!cert) return null;
  if ((cert as any).revoked_at) return { valid: false, reason: "revoked", revoked_at: (cert as any).revoked_at, revoked_reason: (cert as any).revoked_reason };
  return { valid: true, certificate: cert };
}

// ─── Analytics ───

export async function getAnalytics() {
  const database = await db();
  if (!database) return { total: 0, passed: 0, failed: 0, deployments: 0, certificates: 0, bySource: [] };
  const total = await database.prepare("SELECT COUNT(*) as n FROM provenance_records").first<{ n: number }>();
  const passed = await database.prepare("SELECT COUNT(*) as n FROM provenance_records WHERE build_status = 'passed'").first<{ n: number }>();
  const failed = await database.prepare("SELECT COUNT(*) as n FROM provenance_records WHERE build_status = 'failed'").first<{ n: number }>();
  const deployments = await database.prepare("SELECT COUNT(*) as n FROM provenance_deployments").first<{ n: number }>();
  const certificates = await database.prepare("SELECT COUNT(*) as n FROM provenance_certificates").first<{ n: number }>();
  const bySource = await database.prepare("SELECT source_project, COUNT(*) as n FROM provenance_records GROUP BY source_project").all();
  return {
    total: total?.n ?? 0, passed: passed?.n ?? 0, failed: failed?.n ?? 0,
    deployments: deployments?.n ?? 0, certificates: certificates?.n ?? 0,
    bySource: bySource.results ?? [],
  };
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── GraphQL Resolver ───

export async function graphql(query: string, variables?: Record<string, any>) {
  const database = await db();
  if (!database) throw new Error("Database not available");

  // Simple GraphQL executor — handles the queries we need
  const gql = query.trim();

  // Query: provenance(id)
  const recordMatch = gql.match(/provenance\s*\(\s*id:\s*"([^"]+)"\s*\)/);
  if (recordMatch) {
    const record = await getRecord(recordMatch[1]);
    if (!record) return { data: { provenance: null } };
    return { data: { provenance: record } };
  }

  // Query: provenances(source?, limit?, offset?)
  const listMatch = gql.match(/provenances\s*\(([^)]*)\)/);
  if (listMatch) {
    const args = parseArgs(listMatch[1]);
    const result = await listRecords(args.source, args.limit ?? 50, args.offset ?? 0);
    return { data: { provenances: result.data } };
  }

  // Query: analytics
  if (gql.includes("analytics") && !gql.includes("(")) {
    const analytics = await getAnalytics();
    return { data: { analytics } };
  }

  // Mutation: createRecord
  const createMatch = gql.match(/createRecord\s*\(([^)]*)\)/);
  if (createMatch && gql.includes("mutation")) {
    // Parse the input JSON from the mutation
    const inputMatch = gql.match(/input:\s*(\{[^}]+\})/);
    if (inputMatch) {
      const input = JSON.parse(inputMatch[1]);
      const result = await createRecord(input);
      return { data: { createRecord: result } };
    }
    // Try to extract from variables
    if (variables?.input) {
      const result = await createRecord(variables.input);
      return { data: { createRecord: result } };
    }
  }

  return { data: null, errors: [{ message: "Query not supported or malformed" }] };
}

function parseArgs(str: string): Record<string, any> {
  const args: Record<string, any> = {};
  str.split(",").forEach(pair => {
    const [key, val] = pair.split(":").map(s => s.trim());
    if (!key || !val) return;
    if (val === "true") args[key] = true;
    else if (val === "false") args[key] = false;
    else if (!isNaN(Number(val))) args[key] = Number(val);
    else args[key] = val.replace(/"/g, "");
  });
  return args;
}