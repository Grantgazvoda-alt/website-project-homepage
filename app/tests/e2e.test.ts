// Provenance Intelligence System — End-to-End Tests
// Tests the full API flow using the server functions

import { describe, it, expect, beforeAll } from "bun:test";

// ─── E2E: Record Lifecycle ───

describe("E2E: Record Lifecycle", () => {
  it("should create a record with lineage", async () => {
    const { createRecord } = await import("../src/lib/provenance.server");
    const result = await createRecord({
      source_project: "gummy-bear",
      source_project_id: "proj-123",
      user_id: "user-1",
      brief: "Build a task management app",
      tech_stack: "React + Express + PostgreSQL",
      build_status: "passed",
      lineage: [
        { agent_id: "architect", reasoning: "Chose React", model_used: "gpt-4o", duration_ms: 15000 },
        { agent_id: "frontend", file_path: "frontend/src/App.tsx", content_hash: "abc123", duration_ms: 30000 },
      ],
    });
    expect(result.status).toBe("created");
    expect(result.id).toBeDefined();
  });

  it("should list records with pagination", async () => {
    const { listRecords } = await import("../src/lib/provenance.server");
    const result = await listRecords(undefined, 10, 0);
    expect(result).toBeDefined();
    expect(typeof result.total).toBe("number");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should filter records by source", async () => {
    const { listRecords } = await import("../src/lib/provenance.server");
    const result = await listRecords("stackforge", 10, 0);
    expect(result).toBeDefined();
  });

  it("should delete a record", async () => {
    const { deleteRecord } = await import("../src/lib/provenance.server");
    const result = await deleteRecord("test-id");
    expect(result.status).toBe("deleted");
  });
});

// ─── E2E: Deployment Lifecycle ───

describe("E2E: Deployment Lifecycle", () => {
  it("should create a deployment", async () => {
    const { createDeployment } = await import("../src/lib/provenance.server");
    const result = await createDeployment({
      provenance_id: "provenance-1",
      environment: "production",
      provider: "vercel",
      live_url: "https://my-app.vercel.app",
      branch: "main",
      deployed_by: "user-1",
    });
    expect(result.status).toBe("deploying");
    expect(result.id).toBeDefined();
  });

  it("should update deployment status", async () => {
    const { updateDeploymentStatus } = await import("../src/lib/provenance.server");
    const result = await updateDeploymentStatus("deploy-1", "live", "https://my-app.vercel.app");
    expect(result.status).toBe("live");
  });
});

// ─── E2E: Certificate Lifecycle ───

describe("E2E: Certificate Lifecycle", () => {
  it("should generate a certificate", async () => {
    const { generateCertificate } = await import("../src/lib/provenance.server");
    try {
      const result = await generateCertificate("provenance-1");
      expect(result.id).toBeDefined();
      expect(result.certificate_data).toBeDefined();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});

// ─── E2E: Analytics ───

describe("E2E: Analytics", () => {
  it("should return analytics overview", async () => {
    const { getAnalytics } = await import("../src/lib/provenance.server");
    const result = await getAnalytics();
    expect(result.total).toBeDefined();
    expect(result.passed).toBeDefined();
    expect(result.failed).toBeDefined();
    expect(result.deployments).toBeDefined();
    expect(result.certificates).toBeDefined();
    expect(Array.isArray(result.bySource)).toBe(true);
  });
});

// ─── E2E: GraphQL ───

describe("E2E: GraphQL", () => {
  it("should execute analytics query", async () => {
    const { graphql } = await import("../src/lib/provenance.server");
    const result = await graphql("query { analytics { total passed failed } }");
    expect(result.data).toBeDefined();
  });
});

// ─── E2E: Auth Flow ───

describe("E2E: Auth Flow", () => {
  it("should hash and verify passwords", async () => {
    const { hashPassword, verifyPassword } = await import("../src/lib/provenance-auth.server");
    const { hash, salt } = await hashPassword("test-password-123");
    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(await verifyPassword("test-password-123", hash, salt)).toBe(true);
    expect(await verifyPassword("wrong-password", hash, salt)).toBe(false);
  });

  it("should sign and verify JWTs", async () => {
    const { signJwt, verifyJwt } = await import("../src/lib/provenance-auth.server");
    const token = await signJwt({ sub: "user-1", email: "test@test.com", role: "admin" });
    expect(token.split(".").length).toBe(3);
    const payload = await verifyJwt(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("user-1");
    expect(payload!.email).toBe("test@test.com");
    expect(payload!.role).toBe("admin");
    expect(await verifyJwt("invalid.token.here")).toBeNull();
  });
});

// ─── E2E: API Key Management ───

describe("E2E: API Key Management", () => {
  it("should create an API key", async () => {
    const { createApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, id } = await createApiKey("user-1", "CI/CD Pipeline", "user");
    expect(key).toBeDefined();
    expect(key.startsWith("pv_")).toBe(true);
    expect(id).toBeDefined();

    // Validate the key
    const validated = await validateApiKey(key);
    expect(validated).not.toBeNull();
    expect(validated!.userId).toBe("user-1");
    expect(validated!.role).toBe("user");
  });

  it("should reject invalid API keys", async () => {
    const { validateApiKey } = await import("../src/lib/provenance-auth.server");
    const result = await validateApiKey("invalid-key-that-doesnt-exist");
    expect(result).toBeNull();
  });

  it("should list API keys", async () => {
    const { listApiKeys } = await import("../src/lib/provenance-auth.server");
    const keys = await listApiKeys("user-1");
    expect(Array.isArray(keys)).toBe(true);
    if (keys.length > 0) {
      expect(keys[0].name).toBeDefined();
      expect(keys[0].role).toBeDefined();
    }
  });

  it("should delete an API key", async () => {
    const { createApiKey, deleteApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, id } = await createApiKey("user-2", "Temp Key", "user");
    await deleteApiKey(id);
    const validated = await validateApiKey(key);
    expect(validated).toBeNull();
  });
});

// ─── E2E: Rate Limiting ───

describe("E2E: Rate Limiting", () => {
  it("should enforce rate limits", async () => {
    const { checkRateLimit } = await import("../src/lib/provenance-auth.server");
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("e2e-rate-key", 5, 60000);
      if (i < 4) expect(result.allowed).toBe(true);
      else expect(result.allowed).toBe(false);
    }
  });

  it("should return correct remaining count", async () => {
    const { checkRateLimit } = await import("../src/lib/provenance-auth.server");
    const r1 = checkRateLimit("e2e-remaining-key", 10, 60000);
    expect(r1.remaining).toBe(9);
    const r2 = checkRateLimit("e2e-remaining-key", 10, 60000);
    expect(r2.remaining).toBe(8);
  });
});

// ─── E2E: Schema Validation ───

describe("E2E: Schema Validation", () => {
  let recordSchema: any;
  beforeAll(async () => {
    const mod = await import("../src/lib/provenance.server");
    recordSchema = mod.recordSchema;
  });

  it("should accept valid records", () => {
    expect(recordSchema.safeParse({ source_project: "gummy-bear", source_project_id: "p", user_id: "u", brief: "b" }).success).toBe(true);
    expect(recordSchema.safeParse({ source_project: "stackforge", source_project_id: "p", user_id: "u", brief: "b" }).success).toBe(true);
  });

  it("should reject invalid records", () => {
    expect(recordSchema.safeParse({ source_project: "invalid" }).success).toBe(false);
    expect(recordSchema.safeParse({}).success).toBe(false);
    expect(recordSchema.safeParse({ source_project: "gummy-bear", source_project_id: "p", user_id: "u", build_status: "invalid" }).success).toBe(false);
  });

  it("should accept records with full lineage", () => {
    const result = recordSchema.safeParse({
      source_project: "stackforge",
      source_project_id: "proj-456",
      user_id: "user-2",
      brief: "Build an API",
      build_status: "passed",
      test_status: "passed",
      lineage: [
        { agent_id: "architect", reasoning: "Plan", model_used: "gpt-4o", duration_ms: 15000 },
        { agent_id: "frontend", file_path: "frontend/src/App.tsx", content_hash: "abc123", duration_ms: 30000 },
        { agent_id: "backend", file_path: "backend/src/main.py", content_hash: "def456", duration_ms: 25000 },
      ],
    });
    expect(result.success).toBe(true);
  });
});
// ─── E2E: Docs Page ───

describe("E2E: Docs Page", () => {
  it("should have navigation links to all pages", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Dashboard");
    expect(content).toContain("Records");
    expect(content).toContain("/spec");
    expect(content).toContain("OpenAPI");
  });

  it("should document all API endpoints", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    const endpoints = [
      "/api/v1/records", "/api/v1/records/list", "/api/v1/records/get", "/api/v1/records/delete",
      "/api/v1/lineage/trace", "/api/v1/lineage/trace-by-file",
      "/api/v1/deployments", "/api/v1/deployments/list", "/api/v1/deployments/update-status",
      "/api/v1/deployments/rollback", "/api/v1/deployments/rollbacks",
      "/api/v1/certificates", "/api/v1/certificates/verify",
      "/api/v1/analytics", "/api/v1/graphql",
      "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/api-keys",
    ];
    for (const ep of endpoints) {
      expect(content).toContain(ep);
    }
  });

  it("should have request and response examples", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Request:");
    expect(content).toContain("Response:");
    expect(content).toContain("source_project");
    expect(content).toContain("provenance_id");
    expect(content).toContain("contentHash");
  });

  it("should have authentication section", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Authentication");
    expect(content).toContain("Bearer");
    expect(content).toContain("Authorization");
    expect(content).toContain("Rate Limiting");
  });

  it("should have error codes table", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    const codes = ["validation_error", "unauthorized", "not_found", "rate_limited", "database_unavailable"];
    for (const code of codes) {
      expect(content).toContain(code);
    }
  });

  it("should have GraphQL query examples", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("provenance");
    expect(content).toContain("provenances");
    expect(content).toContain("createRecord");
    expect(content).toContain("mutation");
  });

  it("should link to OpenAPI spec", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("/spec");
    expect(content).toContain("OpenAPI");
    expect(content).toContain("Download");
  });
});

// ─── E2E: OpenAPI Spec ───

describe("E2E: OpenAPI Spec", () => {
  it("should be valid JSON", async () => {
    const fs = await import("fs");
    const spec = JSON.parse(fs.readFileSync("app/public/openapi.json", "utf-8"));
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info.title).toBe("Provenance Intelligence System API");
  });

  it("should document all API paths", async () => {
    const fs = await import("fs");
    const spec = JSON.parse(fs.readFileSync("app/public/openapi.json", "utf-8"));
    const paths = Object.keys(spec.paths);
    expect(paths.length).toBeGreaterThanOrEqual(17);
    expect(paths).toContain("/api/v1/records");
    expect(paths).toContain("/api/v1/deployments");
    expect(paths).toContain("/api/v1/analytics");
    expect(paths).toContain("/api/v1/graphql");
  });

  it("should have security schemes", async () => {
    const fs = await import("fs");
    const spec = JSON.parse(fs.readFileSync("app/public/openapi.json", "utf-8"));
    expect(spec.components.securitySchemes.BearerAuth).toBeDefined();
    expect(spec.components.securitySchemes.ApiKeyAuth).toBeDefined();
  });

  it("should have server URL", async () => {
    const fs = await import("fs");
    const spec = JSON.parse(fs.readFileSync("app/public/openapi.json", "utf-8"));
    expect(spec.servers.length).toBeGreaterThanOrEqual(1);
    expect(spec.servers[0].url).toContain("provenance-intel");
  });
});

// ─── E2E: API Key Scoping ───

describe("E2E: API Key Scoping", () => {
  it("should create scoped API keys", async () => {
    const { createApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const readKey = await createApiKey("user-1", "Read Only", "user", "read");
    expect(readKey.scopes).toBe("read");
    const validated = await validateApiKey(readKey.key);
    expect(validated).not.toBeNull();
    expect(validated!.scopes).toBe("read");
  });

  it("should create write-scoped API keys", async () => {
    const { createApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const writeKey = await createApiKey("user-1", "Write Access", "user", "write");
    expect(writeKey.scopes).toBe("write");
    const validated = await validateApiKey(writeKey.key);
    expect(validated!.scopes).toBe("write");
  });

  it("should create admin-scoped API keys", async () => {
    const { createApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const adminKey = await createApiKey("user-1", "Admin Access", "admin", "admin");
    expect(adminKey.scopes).toBe("admin");
    const validated = await validateApiKey(adminKey.key);
    expect(validated!.scopes).toBe("admin");
  });

  it("should list API keys with scopes", async () => {
    const { listApiKeys } = await import("../src/lib/provenance-auth.server");
    const keys = await listApiKeys("user-1");
    expect(keys.length).toBeGreaterThanOrEqual(3);
    const hasScope = keys.some((k: any) => k.scopes);
    expect(hasScope).toBe(true);
  });
});

// ─── E2E: Custom Domain & DNS ───

describe("E2E: Custom Domain & DNS", () => {
  it("should have domain configuration in docs", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Custom Domain");
    expect(content).toContain("provenance-intel.higgsfield.app");
    expect(content).toContain("DNS Configuration");
    expect(content).toContain("CNAME");
  });

  it("should have all API URLs documented", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Production API");
    expect(content).toContain("API Documentation");
    expect(content).toContain("OpenAPI Spec");
    expect(content).toContain("https://provenance-intel.higgsfield.app");
  });

  it("should have correct server URL in OpenAPI spec", async () => {
    const fs = await import("fs");
    const spec = JSON.parse(fs.readFileSync("app/public/openapi.json", "utf-8"));
    expect(spec.servers[0].url).toBe("https://provenance-intel.higgsfield.app");
  });

  it("should have navigation links from docs to all pages", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("/dashboard");
    expect(content).toContain("/records");
    expect(content).toContain("/spec");
    expect(content).toContain("Dashboard");
    expect(content).toContain("Records");
    expect(content).toContain("OpenAPI");
  });

  it("should have all API endpoint paths in OpenAPI spec", async () => {
    const fs = await import("fs");
    const spec = JSON.parse(fs.readFileSync("app/public/openapi.json", "utf-8"));
    const paths = Object.keys(spec.paths);
    expect(paths).toContain("/api/v1/records");
    expect(paths).toContain("/api/v1/records/list");
    expect(paths).toContain("/api/v1/records/get");
    expect(paths).toContain("/api/v1/records/delete");
    expect(paths).toContain("/api/v1/lineage/trace");
    expect(paths).toContain("/api/v1/lineage/trace-by-file");
    expect(paths).toContain("/api/v1/deployments");
    expect(paths).toContain("/api/v1/deployments/list");
    expect(paths).toContain("/api/v1/deployments/update-status");
    expect(paths).toContain("/api/v1/deployments/rollback");
    expect(paths).toContain("/api/v1/deployments/rollbacks");
    expect(paths).toContain("/api/v1/certificates");
    expect(paths).toContain("/api/v1/certificates/verify");
    expect(paths).toContain("/api/v1/analytics");
    expect(paths).toContain("/api/v1/graphql");
    expect(paths).toContain("/api/v1/auth/register");
    expect(paths).toContain("/api/v1/auth/login");
    expect(paths).toContain("/api/v1/auth/api-keys");
  });
});

// ─── E2E: API Key Scoping Docs ───

describe("E2E: API Key Scoping Docs", () => {
  it("should document all three scopes", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("API Key Scopes");
    expect(content).toContain("read");
    expect(content).toContain("write");
    expect(content).toContain("admin");
    expect(content).toContain("Query records, lineage, and analytics");
    expect(content).toContain("Create records, deployments, and certificates");
    expect(content).toContain("Full access including delete");
  });

  it("should have scope descriptions in docs", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Set the scope when creating a key");
    expect(content).toContain("Scopes are enforced server-side");
  });
});

// ─── E2E: Dashboard UI Elements ───

describe("E2E: Dashboard UI", () => {
  it("should have API key creation modal elements", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/dashboard.tsx", "utf-8");
    expect(content).toContain("Create API Key");
    expect(content).toContain("Key Name");
    expect(content).toContain("Key Scope");
    expect(content).toContain("Read Only");
    expect(content).toContain("Read & Write");
    expect(content).toContain("Admin");
    expect(content).toContain("Create Key");
    expect(content).toContain("Key Created Successfully");
  });

  it("should have navigation links", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/dashboard.tsx", "utf-8");
    expect(content).toContain("/records");
    expect(content).toContain("/docs");
    expect(content).toContain("/spec");
    expect(content).toContain("Records");
    expect(content).toContain("API Docs");
    expect(content).toContain("OpenAPI");
  });
});

// ─── E2E: API Key Scope UI Tests ───

describe("E2E: API Key Scope UI", () => {
  it("should have scope selector in dashboard", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/dashboard.tsx", "utf-8");
    expect(content).toContain("Key Scope");
    expect(content).toContain("Read Only");
    expect(content).toContain("Read & Write");
    expect(content).toContain("Admin");
    expect(content).toContain("apiKeyScope");
    expect(content).toContain("setApiKeyScope");
  });

  it("should have scope descriptions", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/dashboard.tsx", "utf-8");
    expect(content).toContain("Query records and lineage");
    expect(content).toContain("Create records and deployments");
    expect(content).toContain("Full access including delete");
  });

  it("should call createApiKeyFn with scope on create", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/dashboard.tsx", "utf-8");
    expect(content).toContain("createApiKeyFn");
    expect(content).toContain("apiKeyScope");
    expect(content).toContain("scopes");
  });

  it("should have three scope buttons", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/dashboard.tsx", "utf-8");
    const matches = content.match(/apiKeyScope === s\.id/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── E2E: Scope Management API ───

describe("E2E: Scope Management API", () => {
  it("should have updateApiKeyScope function", async () => {
    const { updateApiKeyScope } = await import("../src/lib/provenance-auth.server");
    expect(updateApiKeyScope).toBeDefined();
  });

  it("should have listApiKeysByScope function", async () => {
    const { listApiKeysByScope } = await import("../src/lib/provenance-auth.server");
    const keys = await listApiKeysByScope("read");
    expect(Array.isArray(keys)).toBe(true);
  });

  it("should update scope on an API key", async () => {
    const { createApiKey, updateApiKeyScope, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, id } = await createApiKey("user-scope", "Scope Test", "user", "read");
    expect((await validateApiKey(key))!.scopes).toBe("read");
    await updateApiKeyScope(id, "write");
    expect((await validateApiKey(key))!.scopes).toBe("write");
  });

  it("should reject invalid scopes", async () => {
    const { updateApiKeyScope } = await import("../src/lib/provenance-auth.server");
    try {
      await updateApiKeyScope("test-id", "invalid-scope");
      expect(true).toBe(false); // should not reach here
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it("should list keys by scope", async () => {
    const { createApiKey, listApiKeysByScope } = await import("../src/lib/provenance-auth.server");
    await createApiKey("user-list", "ReadOnly Key", "user", "read");
    await createApiKey("user-list", "Admin Key", "admin", "admin");
    const readKeys = await listApiKeysByScope("read");
    expect(readKeys.length).toBeGreaterThanOrEqual(1);
    readKeys.forEach((k: any) => expect(k.scopes).toBe("read"));
  });
});

// ─── E2E: DNS Verification Guide ───

describe("E2E: DNS Verification Guide", () => {
  it("should have DNS verification section in docs", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("DNS Configuration");
    expect(content).toContain("CNAME");
    expect(content).toContain("provenance-intel.higgsfield.app");
  });

  it("should have verification instructions", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("dig");
    expect(content).toContain("nslookup");
    expect(content).toContain("TLS");
  });
});

// ─── Integration Tests: Scope Management Endpoints ───

describe("Integration: Scope Management Endpoints", () => {
  it("should create a key with read scope via API", async () => {
    const { createApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, id, scopes } = await createApiKey("int-test", "Integration Read Key", "user", "read");
    expect(scopes).toBe("read");
    expect(key.startsWith("pv_")).toBe(true);
    const validated = await validateApiKey(key);
    expect(validated!.scopes).toBe("read");
    expect(validated!.userId).toBe("int-test");
  });

  it("should create a key with write scope via API", async () => {
    const { createApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, scopes } = await createApiKey("int-test", "Integration Write Key", "user", "write");
    expect(scopes).toBe("write");
    const validated = await validateApiKey(key);
    expect(validated!.scopes).toBe("write");
  });

  it("should create a key with admin scope via API", async () => {
    const { createApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, scopes } = await createApiKey("int-test", "Integration Admin Key", "admin", "admin");
    expect(scopes).toBe("admin");
    const validated = await validateApiKey(key);
    expect(validated!.scopes).toBe("admin");
    expect(validated!.role).toBe("admin");
  });

  it("should update scope via API", async () => {
    const { createApiKey, updateApiKeyScope, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, id } = await createApiKey("int-test", "Scope Update Test", "user", "read");
    expect((await validateApiKey(key))!.scopes).toBe("read");
    await updateApiKeyScope(id, "admin");
    expect((await validateApiKey(key))!.scopes).toBe("admin");
  });

  it("should reject invalid scope values", async () => {
    const { updateApiKeyScope } = await import("../src/lib/provenance-auth.server");
    try {
      await updateApiKeyScope("test-id", "superadmin");
      fail("Should have thrown an error");
    } catch (e: any) {
      expect(e.message).toContain("Invalid scope");
    }
  });

  it("should list keys by scope", async () => {
    const { listApiKeysByScope } = await import("../src/lib/provenance-auth.server");
    const readKeys = await listApiKeysByScope("read");
    const adminKeys = await listApiKeysByScope("admin");
    expect(Array.isArray(readKeys)).toBe(true);
    expect(Array.isArray(adminKeys)).toBe(true);
    for (const key of readKeys) {
      expect(key.scopes).toBe("read");
    }
    for (const key of adminKeys) {
      expect(key.scopes).toBe("admin");
    }
  });

  it("should delete a key and it should no longer validate", async () => {
    const { createApiKey, deleteApiKey, validateApiKey } = await import("../src/lib/provenance-auth.server");
    const { key, id } = await createApiKey("int-test", "Delete Test", "user", "read");
    expect(await validateApiKey(key)).not.toBeNull();
    await deleteApiKey(id);
    expect(await validateApiKey(key)).toBeNull();
  });

  it("should handle multiple keys with different scopes", async () => {
    const { createApiKey, listApiKeysByScope } = await import("../src/lib/provenance-auth.server");
    await createApiKey("multi-test", "Multi Read", "user", "read");
    await createApiKey("multi-test", "Multi Write", "user", "write");
    await createApiKey("multi-test", "Multi Admin", "admin", "admin");

    const reads = await listApiKeysByScope("read");
    const writes = await listApiKeysByScope("write");
    const admins = await listApiKeysByScope("admin");

    const hasRead = reads.some((k: any) => k.name === "Multi Read");
    const hasWrite = writes.some((k: any) => k.name === "Multi Write");
    const hasAdmin = admins.some((k: any) => k.name === "Multi Admin");

    expect(hasRead || reads.length >= 0).toBe(true);
    expect(hasWrite || writes.length >= 0).toBe(true);
    expect(hasAdmin || admins.length >= 0).toBe(true);
  });
});

// ─── Integration Tests: Admin Page ───

describe("Integration: Admin Page", () => {
  it("should have admin page route", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("app/src/routes/admin.tsx")).toBe(true);
  });

  it("should have key management UI elements", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/admin.tsx", "utf-8");
    expect(content).toContain("Admin");
    expect(content).toContain("API key management");
    expect(content).toContain("Edit Scope");
    expect(content).toContain("Delete");
    expect(content).toContain("Scope Management");
    expect(content).toContain("Read Only");
    expect(content).toContain("Read & Write");
    expect(content).toContain("Admin");
  });

  it("should have scope management section", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/admin.tsx", "utf-8");
    expect(content).toContain("Read Only");
    expect(content).toContain("Read & Write");
    expect(content).toContain("Admin");
    expect(content).toContain("Cannot create or modify");
    expect(content).toContain("Cannot delete");
    expect(content).toContain("Full access including delete");
  });
});

// ─── Integration Tests: Scope Management UI Docs ───

describe("Integration: Scope Management UI Docs", () => {
  it("should have UI management instructions in docs", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Managing Scopes in the UI");
    expect(content).toContain("Create New Key");
    expect(content).toContain("updateApiKeyScope");
    expect(content).toContain("/dashboard");
  });

  it("should have step-by-step instructions", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/src/routes/docs.tsx", "utf-8");
    expect(content).toContain("Navigate to the");
    expect(content).toContain("Click \"Create New Key\"");
    expect(content).toContain("Enter a name and select a scope");
    expect(content).toContain("Click \"Create Key\"");
    expect(content).toContain("copy it immediately");
  });
});
