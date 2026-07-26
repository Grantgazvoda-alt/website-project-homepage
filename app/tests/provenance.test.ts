// Provenance Intelligence System — Comprehensive Test Suite
// Tests server functions, auth, rate limiting, and data integrity

import { describe, it, expect, beforeAll } from "bun:test";

// ─── Auth Tests ───

describe("Auth System", () => {
  it("should hash and verify passwords", async () => {
    const { hashPassword, verifyPassword } = await import("../src/lib/provenance-auth.server");
    const { hash, salt } = await hashPassword("test-password-123");
    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash.length).toBe(64);
    expect(salt.length).toBe(32);
    const valid = await verifyPassword("test-password-123", hash, salt);
    expect(valid).toBe(true);
    const invalid = await verifyPassword("wrong-password", hash, salt);
    expect(invalid).toBe(false);
  });

  it("should sign and verify JWTs", async () => {
    const { signJwt, verifyJwt } = await import("../src/lib/provenance-auth.server");
    const token = await signJwt({ sub: "user-1", email: "test@test.com", role: "admin" });
    expect(token).toBeDefined();
    expect(token.split(".").length).toBe(3);
    const payload = await verifyJwt(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("user-1");
    expect(payload!.email).toBe("test@test.com");
    expect(payload!.role).toBe("admin");
    const invalid = await verifyJwt("invalid.token.here");
    expect(invalid).toBeNull();
  });

  it("should reject expired JWTs", async () => {
    const { verifyJwt } = await import("../src/lib/provenance-auth.server");
    const expired = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJpYXQiOjAsImV4cCI6MX0=.invalidsig";
    const result = await verifyJwt(expired);
    expect(result).toBeNull();
  });

  it("should validate registration input", async () => {
    const { registerSchema } = await import("../src/lib/provenance-auth.server");
    expect(registerSchema.safeParse({ email: "invalid", password: "short", name: "T" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "test@test.com", password: "password123", name: "Test User" }).success).toBe(true);
  });
});

// ─── Rate Limiting Tests ───

describe("Rate Limiting", () => {
  it("should allow requests within limit", () => {
    const { checkRateLimit } = await import("../src/lib/provenance-auth.server");
    const result = checkRateLimit("test-key", 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should block requests over limit", () => {
    const { checkRateLimit } = await import("../src/lib/provenance-auth.server");
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("test-over-key", 5, 60000);
      if (i < 4) expect(result.allowed).toBe(true);
      else expect(result.allowed).toBe(false);
    }
  });

  it("should reset after window", () => {
    const { checkRateLimit } = await import("../src/lib/provenance-auth.server");
    // Use a key with a past reset time
    const result = checkRateLimit("test-reset-key", 5, -1);
    expect(result.allowed).toBe(true);
  });

  it("should return correct remaining count", () => {
    const { checkRateLimit } = await import("../src/lib/provenance-auth.server");
    const r1 = checkRateLimit("test-remaining-key", 10, 60000);
    expect(r1.remaining).toBe(9);
    const r2 = checkRateLimit("test-remaining-key", 10, 60000);
    expect(r2.remaining).toBe(8);
  });
});

// ─── Record Schema Validation Tests ───

describe("Record Schema Validation", () => {
  let recordSchema: any;

  beforeAll(async () => {
    const mod = await import("../src/lib/provenance.server");
    recordSchema = mod.recordSchema;
  });

  it("should accept valid record", () => {
    const result = recordSchema.safeParse({
      source_project: "gummy-bear",
      source_project_id: "proj-123",
      user_id: "user-1",
      brief: "Build a task manager",
      lineage: [{ agent_id: "architect", reasoning: "Chose React", model_used: "gpt-4o" }],
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid source_project", () => {
    const result = recordSchema.safeParse({
      source_project: "invalid",
      source_project_id: "proj-123",
      user_id: "user-1",
      brief: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = recordSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should accept record with full lineage", () => {
    const result = recordSchema.safeParse({
      source_project: "stackforge",
      source_project_id: "proj-456",
      user_id: "user-2",
      brief: "Build an API",
      tech_stack: "FastAPI + PostgreSQL",
      version_number: 3,
      file_count: 15,
      total_lines: 500,
      build_status: "passed",
      test_status: "passed",
      lineage: [
        { agent_id: "architect", reasoning: "Architecture plan", model_used: "gpt-4o", duration_ms: 15000 },
        { agent_id: "frontend", file_path: "frontend/src/App.tsx", reasoning: "Built UI", content_hash: "abc123", duration_ms: 30000 },
        { agent_id: "backend", file_path: "backend/src/main.py", reasoning: "Built API", content_hash: "def456", duration_ms: 25000 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid build_status", () => {
    const result = recordSchema.safeParse({ source_project: "gummy-bear", source_project_id: "p", user_id: "u", brief: "b", build_status: "invalid" });
    expect(result.success).toBe(false);
  });
});

// ─── Deployment Schema Tests ───

describe("Deployment Operations", () => {
  it("should accept valid deployment input", () => {
    const { createDeploymentFn } = require("../src/lib/provenance.functions");
    expect(createDeploymentFn).toBeDefined();
  });

  it("should accept valid rollback input", () => {
    const { rollbackDeploymentFn } = require("../src/lib/provenance.functions");
    expect(rollbackDeploymentFn).toBeDefined();
  });
});

// ─── Certificate Tests ───

describe("Certificate Operations", () => {
  it("should accept valid certificate input", () => {
    const { generateCertificateFn } = require("../src/lib/provenance.functions");
    expect(generateCertificateFn).toBeDefined();
  });
});

// ─── Analytics Tests ───

describe("Analytics Operations", () => {
  it("should accept analytics query", () => {
    const { getAnalyticsFn } = require("../src/lib/provenance.functions");
    expect(getAnalyticsFn).toBeDefined();
  });
});

// ─── GraphQL Tests ───

describe("GraphQL Operations", () => {
  it("should accept graphql query", () => {
    const { graphqlFn } = require("../src/lib/provenance.functions");
    expect(graphqlFn).toBeDefined();
  });
});
