import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Endpoint({ method, path, desc, body, response }: { method: string; path: string; desc: string; body?: string; response?: string }) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.06)] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${
          method === "POST" ? "bg-[#30d158]/20 text-[#30d158]"
          : method === "GET" ? "bg-[#0071E3]/20 text-[#0071E3]"
          : method === "DELETE" ? "bg-[#ff453a]/20 text-[#ff453a]"
          : "bg-[#ffd60a]/20 text-[#ffd60a]"
        }`}>{method}</span>
        <code className="text-sm font-mono text-[#f5f5f7]">{path}</code>
      </div>
      <p className="text-sm text-[#98989d] mb-2">{desc}</p>
      {body && (
        <div className="mb-2">
          <p className="text-xs text-[#636366] mb-1">Request Body:</p>
          <pre className="rounded-lg bg-[rgba(10,10,15,0.6)] p-3 text-xs font-mono text-[#98989d] overflow-x-auto">{body}</pre>
        </div>
      )}
      {response && (
        <div>
          <p className="text-xs text-[#636366] mb-1">Response:</p>
          <pre className="rounded-lg bg-[rgba(10,10,15,0.6)] p-3 text-xs font-mono text-[#98989d] overflow-x-auto">{response}</pre>
        </div>
      )}
    </div>
  );
}

function DocsPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7]">
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
            </div>
            <span className="font-semibold">Provenance</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Dashboard</Link>
            <Link to="/records" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Records</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="mt-2 text-[#98989d]">Provenance Intelligence System REST API — code lineage, deployment tracking, and origin certificates.</p>

        <div className="mt-8 space-y-6">

          <Section title="Authentication">
            <p className="text-sm text-[#98989d] mb-4">All API endpoints require authentication via Bearer token in the Authorization header. Tokens can be JWT (user session) or API key (programmatic access).</p>
            <Endpoint method="POST" path="/api/v1/auth/register" desc="Register a new user account"
              body={`{
  "email": "user@example.com",
  "password": "secure-password-123",
  "name": "Jane Developer"
}`}
              response={`{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "user@example.com", "name": "Jane Developer" }
}`} />
            <Endpoint method="POST" path="/api/v1/auth/login" desc="Login with email and password"
              body={`{ "email": "user@example.com", "password": "secure-password-123" }`}
              response={`{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "user@example.com", "name": "Jane Developer" }
}`} />
            <Endpoint method="POST" path="/api/v1/auth/api-keys" desc="Create a new API key"
              body={`{ "name": "CI/CD Integration", "role": "user" }`}
              response={`{ "key": "pv_abc123def456...", "id": "uuid" }`}
            />
            <div className="mt-4 p-3 rounded-lg bg-[rgba(255,214,10,0.1)] border border-[rgba(255,214,10,0.2)]">
              <p className="text-xs text-[#ffd60a] font-medium">Rate Limiting</p>
              <p className="text-xs text-[#98989d] mt-1">API keys are rate-limited to 100 requests per minute per key. Exceeded requests return HTTP 429. Response headers include <code className="text-[#ffd60a]">X-RateLimit-Remaining</code> and <code className="text-[#ffd60a]">X-RateLimit-Reset</code>.</p>
            </div>
          </Section>

          <Section title="Provenance Records">
            <p className="text-sm text-[#98989d] mb-4">Records track code generation runs — the brief, architecture plan, agent decisions, and generated files.</p>
            <Endpoint method="POST" path="/api/v1/records" desc="Create a new provenance record with lineage"
              body={`{
  "source_project": "gummy-bear",
  "source_project_id": "uuid",
  "user_id": "uuid",
  "brief": "Build a task management app with team workspaces...",
  "tech_stack": "React + Express + PostgreSQL",
  "build_status": "passed",
  "test_status": "passed",
  "lineage": [
    {
      "agent_id": "architect",
      "reasoning": "Chose React for component-based UI...",
      "model_used": "gpt-4o",
      "duration_ms": 15000
    },
    {
      "agent_id": "frontend",
      "file_path": "frontend/src/App.tsx",
      "reasoning": "Built with functional components...",
      "content_hash": "sha256-abc123",
      "duration_ms": 30000
    }
  ]
}`}
              response={`{ "id": "uuid", "status": "created" }`} />
            <Endpoint method="POST" path="/api/v1/records/list" desc="List provenance records with optional source filter"
              body={`{ "source": "gummy-bear", "limit": 25, "offset": 0 }`}
              response={`{ "data": [{ "id": "uuid", "source_project": "gummy-bear", ... }], "total": 42, "limit": 25, "offset": 0 }`} />
            <Endpoint method="POST" path="/api/v1/records/get" desc="Get a single provenance record with full lineage, deployments, and certificate"
              body={`{ "id": "uuid" }`}
              response={`{
  "id": "uuid",
  "source_project": "gummy-bear",
  "brief": "Build a task management app...",
  "lineage": [{ "agent_id": "architect", "reasoning": "..." }],
  "deployments": [{ "environment": "production", "live_url": "https://..." }],
  "certificate": { "id": "uuid", "valid_from": "2026-07-25..." }
}`} />
            <Endpoint method="POST" path="/api/v1/records/delete" desc="Delete a provenance record and all associated data"
              body={`{ "id": "uuid" }`}
              response={`{ "id": "uuid", "status": "deleted" }`} />
          </Section>

          <Section title="Lineage Tracing">
            <p className="text-sm text-[#98989d] mb-4">Trace generated files back to their origin — the agent, prompt, and reasoning that produced them.</p>
            <Endpoint method="POST" path="/api/v1/lineage/trace" desc="Trace by content hash (SHA-256)"
              body={`{ "contentHash": "sha256-abc123..." }`}
              response={`[{ "agent_id": "frontend", "file_path": "frontend/src/App.tsx", "brief": "Build a task manager...", "reasoning": "Built with hooks..." }]`} />
            <Endpoint method="POST" path="/api/v1/lineage/trace-by-file" desc="Trace by file path and optional repo name"
              body={`{ "filePath": "App.tsx", "repoName": "Grantgazvoda-alt/bitfordge" }`}
              response={`[{ "agent_id": "frontend", "file_path": "frontend/src/App.tsx", "reasoning": "..." }]`} />
          </Section>

          <Section title="Deployments">
            <p className="text-sm text-[#98989d] mb-4">Track deployments across environments (preview, staging, production) and providers (Vercel, Netlify, Render, Cloudflare).</p>
            <Endpoint method="POST" path="/api/v1/deployments" desc="Create a deployment record"
              body={`{
  "provenance_id": "uuid",
  "environment": "production",
  "provider": "vercel",
  "live_url": "https://my-app.vercel.app",
  "branch": "main",
  "deployed_by": "user-uuid"
}`}
              response={`{ "id": "uuid", "status": "deploying" }`} />
            <Endpoint method="POST" path="/api/v1/deployments/list" desc="List deployments, filterable by environment and provider"
              body={`{ "environment": "production", "provider": "vercel", "limit": 50, "offset": 0 }`}
              response={`{ "data": [{ "id": "uuid", "environment": "production", "status": "live", "live_url": "https://..." }], "total": 10 }`} />
            <Endpoint method="POST" path="/api/v1/deployments/update-status" desc="Update deployment status"
              body={`{ "id": "uuid", "status": "live", "liveUrl": "https://my-app.vercel.app" }`}
              response={`{ "id": "uuid", "status": "live" }`} />
            <Endpoint method="POST" path="/api/v1/deployments/rollback" desc="Rollback a deployment with reason"
              body={`{ "deploymentId": "uuid", "reason": "Production bug introduced in v3", "triggeredBy": "manual" }`}
              response={`{ "id": "uuid", "status": "rolled_back" }`} />
            <Endpoint method="POST" path="/api/v1/deployments/rollbacks" desc="List rollback history for a deployment"
              body={`{ "deploymentId": "uuid" }`}
              response={`[{ "id": "uuid", "reason": "Production bug introduced in v3", "triggered_by": "manual", "created_at": "..." }]`} />
          </Section>

          <Section title="Certificates">
            <p className="text-sm text-[#98989d] mb-4">Origin certificates provide cryptographic verification linking generated code back to its source brief and agent decisions.</p>
            <Endpoint method="POST" path="/api/v1/certificates" desc="Generate an origin certificate for a provenance record"
              body={`{ "provenanceId": "uuid" }`}
              response={`{ "id": "uuid", "certificate_data": "{\\"provenance_id\\":\\"uuid\\",\\"brief_hash\\":\\"sha256...\\"}" }`} />
            <Endpoint method="POST" path="/api/v1/certificates/verify" desc="Verify a certificate"
              body={`{ "id": "uuid" }`}
              response={`{ "valid": true, "certificate": { "id": "uuid", "certificate_data": "...", "valid_from": "..." } }`} />
          </Section>

          <Section title="Analytics">
            <p className="text-sm text-[#98989d] mb-4">Cross-project analytics for build success rates, model usage, and deployment statistics.</p>
            <Endpoint method="POST" path="/api/v1/analytics" desc="Get cross-project analytics overview"
              body={`{}`}
              response={`{
  "total": 42,
  "passed": 35,
  "failed": 7,
  "deployments": 28,
  "certificates": 15,
  "bySource": [{ "source_project": "gummy-bear", "n": 30 }, { "source_project": "stackforge", "n": 12 }]
}`} />
          </Section>

          <Section title="GraphQL">
            <p className="text-sm text-[#98989d] mb-4">A single GraphQL endpoint for complex queries and mutations.</p>
            <Endpoint method="POST" path="/api/v1/graphql" desc="Execute GraphQL queries and mutations"
              body={`{
  "query": "query { analytics { total passed failed } }"
}`}
              response={`{ "data": { "analytics": { "total": 42, "passed": 35, "failed": 7 } } }`} />
            <div className="mt-4">
              <p className="text-sm text-[#98989d] mb-2">Supported Queries:</p>
              <div className="space-y-2 text-xs font-mono text-[#98989d]">
                <div className="rounded-lg bg-[rgba(10,10,15,0.6)] p-2">{`{ provenance(id: "uuid") { id brief lineage { agentId filePath reasoning } } }`}</div>
                <div className="rounded-lg bg-[rgba(10,10,15,0.6)] p-2">{`{ provenances(source: "gummy-bear", limit: 10) { id sourceProject buildStatus } }`}</div>
                <div className="rounded-lg bg-[rgba(10,10,15,0.6)] p-2">{`mutation { createRecord(input: { sourceProject: "gummy-bear", ... }) { id status } }`}</div>
              </div>
            </div>
          </Section>

          <Section title="Error Codes">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs uppercase tracking-wide text-[#636366]">
                    <th className="pb-2 pr-4 font-medium">Code</th>
                    <th className="pb-2 pr-4 font-medium">HTTP Status</th>
                    <th className="pb-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-[#98989d]">
                  <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">validation_error</td><td className="py-2 pr-4">400</td><td className="py-2">Invalid input — check the response details for field-level errors</td></tr>
                  <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">unauthorized</td><td className="py-2 pr-4">401</td><td className="py-2">Missing or invalid authentication token</td></tr>
                  <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">not_found</td><td className="py-2 pr-4">404</td><td className="py-2">Requested resource does not exist</td></tr>
                  <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">rate_limited</td><td className="py-2 pr-4">429</td><td className="py-2">Rate limit exceeded — check X-RateLimit-Reset header</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">database_unavailable</td><td className="py-2 pr-4">503</td><td className="py-2">Database is not available — try again shortly</td></tr>
                </tbody>
              </table>
            </div>
          </Section>

        </div>
      </main>
    </div>
  );
}
