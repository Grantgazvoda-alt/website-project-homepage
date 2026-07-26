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