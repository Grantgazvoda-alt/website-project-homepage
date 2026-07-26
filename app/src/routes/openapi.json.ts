import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/openapi/json")({
  component: () => null,
  loader: () => {
    throw new Response(JSON.stringify(openapiSpec, null, 2), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  },
});

const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Provenance Intelligence System API",
    version: "1.0.0",
    description: "REST API for code lineage tracking, deployment provenance, and origin certificates.",
    contact: { name: "Provenance Intelligence System" },
  },
  servers: [{ url: "https://provenance-intel.higgsfield.app", description: "Production" }],
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      ApiKeyAuth: { type: "apiKey", in: "header", name: "Authorization", description: "API key with 'Bearer ' prefix" },
    },
    schemas: {
      ProvenanceRecord: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          source_project: { type: "string", enum: ["stackforge", "gummy-bear"] },
          source_project_id: { type: "string" },
          brief: { type: "string" },
          architecture_plan: { type: "string" },
          tech_stack: { type: "string" },
          version_number: { type: "integer" },
          file_count: { type: "integer" },
          total_lines: { type: "integer" },
          build_status: { type: "string", enum: ["pending", "passed", "failed", "not_run"] },
          test_status: { type: "string", enum: ["pending", "passed", "failed", "not_run"] },
          created_at: { type: "string", format: "date-time" },
        },
      },
      LineageEntry: {
        type: "object",
        properties: {
          agent_id: { type: "string", enum: ["architect", "frontend", "backend", "database", "api", "devops", "reviewer"] },
          file_path: { type: "string" },
          reasoning: { type: "string" },
          model_used: { type: "string" },
          content_hash: { type: "string" },
          duration_ms: { type: "integer" },
        },
      },
      Deployment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          environment: { type: "string", enum: ["preview", "staging", "production"] },
          provider: { type: "string", enum: ["vercel", "netlify", "render", "cloudflare"] },
          status: { type: "string", enum: ["queued", "building", "deploying", "live", "failed", "rolled_back"] },
          live_url: { type: "string", format: "uri" },
          branch: { type: "string" },
          deployed_at: { type: "string", format: "date-time" },
        },
      },
      Certificate: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          valid_from: { type: "string", format: "date-time" },
          valid_until: { type: "string", format: "date-time" },
          revoked_at: { type: "string", format: "date-time" },
        },
      },
      Rollback: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          reason: { type: "string" },
          triggered_by: { type: "string", enum: ["manual", "automated", "build_failure"] },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "array", items: { type: "object" } },
        },
      },
    },
  },
  paths: {
    "/api/v1/records": {
      post: {
        summary: "Create a provenance record",
        description: "Creates a new provenance record with lineage entries for each agent's output.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProvenanceRecord" } } } },
        responses: { "201": { description: "Record created", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" }, status: { type: "string" } } } } } } },
      },
    },
    "/api/v1/records/list": {
      post: {
        summary: "List provenance records",
        description: "Paginated list of provenance records, filterable by source project.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { source: { type: "string" }, limit: { type: "integer" }, offset: { type: "integer" } } } } } },
        responses: { "200": { description: "List of records", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProvenanceRecord" } }, total: { type: "integer" } } } } } } },
      },
    },
    "/api/v1/records/get": {
      post: {
        summary: "Get a single record",
        description: "Returns a full provenance record with lineage, deployments, and certificate.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { id: { type: "string", format: "uuid" } } } } } },
        responses: { "200": { description: "Full record with lineage and deployments" } },
      },
    },
    "/api/v1/records/delete": {
      post: {
        summary: "Delete a record",
        description: "Deletes a provenance record and all associated data (lineage, deployments, certificates).",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { id: { type: "string", format: "uuid" } } } } } },
        responses: { "200": { description: "Record deleted" } },
      },
    },
    "/api/v1/lineage/trace": {
      post: {
        summary: "Trace by content hash",
        description: "Trace a file's origin by its SHA-256 content hash.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { contentHash: { type: "string" } } } } } },
        responses: { "200": { description: "Lineage entries for the content hash" } },
      },
    },
    "/api/v1/lineage/trace-by-file": {
      post: {
        summary: "Trace by file path",
        description: "Trace a file's origin by its file path and optional repo name.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { filePath: { type: "string" }, repoName: { type: "string" } } } } } },
        responses: { "200": { description: "Lineage entries for the file path" } },
      },
    },
    "/api/v1/deployments": {
      post: {
        summary: "Create a deployment",
        description: "Records a deployment of a provenance record to a specific environment.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { provenance_id: { type: "string" }, environment: { type: "string" }, provider: { type: "string" }, live_url: { type: "string" }, branch: { type: "string" } } } } } },
        responses: { "201": { description: "Deployment created" } },
      },
    },
    "/api/v1/deployments/list": {
      post: {
        summary: "List deployments",
        description: "Paginated list of deployments, filterable by environment and provider.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { environment: { type: "string" }, provider: { type: "string" }, limit: { type: "integer" }, offset: { type: "integer" } } } } } },
        responses: { "200": { description: "List of deployments" } },
      },
    },
    "/api/v1/deployments/update-status": {
      post: {
        summary: "Update deployment status",
        description: "Updates the status of an existing deployment.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, liveUrl: { type: "string" } } } } } },
        responses: { "200": { description: "Status updated" } },
      },
    },
    "/api/v1/deployments/rollback": {
      post: {
        summary: "Rollback a deployment",
        description: "Rolls back a deployment to a previous version with a reason.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { deploymentId: { type: "string" }, reason: { type: "string" }, triggeredBy: { type: "string" } } } } } },
        responses: { "200": { description: "Deployment rolled back" } },
      },
    },
    "/api/v1/deployments/rollbacks": {
      post: {
        summary: "List rollback history",
        description: "Lists all rollback events for a deployment.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { deploymentId: { type: "string" } } } } } },
        responses: { "200": { description: "List of rollbacks" } },
      },
    },
    "/api/v1/certificates": {
      post: {
        summary: "Generate a certificate",
        description: "Generates an origin certificate for a provenance record.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { provenanceId: { type: "string" } } } } } },
        responses: { "201": { description: "Certificate generated" } },
      },
    },
    "/api/v1/certificates/verify": {
      post: {
        summary: "Verify a certificate",
        description: "Verifies the validity of an origin certificate.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } } } } } },
        responses: { "200": { description: "Verification result" } },
      },
    },
    "/api/v1/analytics": {
      post: {
        summary: "Get analytics",
        description: "Returns cross-project analytics overview including build success rates and deployment counts.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        responses: { "200": { description: "Analytics data" } },
      },
    },
    "/api/v1/graphql": {
      post: {
        summary: "Execute GraphQL query",
        description: "Executes a GraphQL query or mutation against the provenance data.",
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { query: { type: "string" }, variables: { type: "object" } } } } } },
        responses: { "200": { description: "GraphQL response" } },
      },
    },
    "/api/v1/auth/register": {
      post: {
        summary: "Register a new user",
        description: "Creates a new user account with email and password.",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 }, name: { type: "string" } } } } } },
        responses: { "201": { description: "User registered", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { type: "object" } } } } } } },
      },
    },
    "/api/v1/auth/login": {
      post: {
        summary: "Login",
        description: "Authenticates a user and returns a JWT token.",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string", format: "email" }, password: { type: "string" } } } } } },
        responses: { "200": { description: "Login successful", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { type: "object" } } } } } } },
      },
    },
    "/api/v1/auth/api-keys": {
      post: {
        summary: "Create an API key",
        description: "Creates a new API key for programmatic access.",
        security: [{ BearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, role: { type: "string" } } } } } },
        responses: { "201": { description: "API key created", content: { "application/json": { schema: { type: "object", properties: { key: { type: "string" }, id: { type: "string" } } } } } } },
      },
    },
  },
};
