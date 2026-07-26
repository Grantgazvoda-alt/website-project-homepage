import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="glass rounded-xl p-6 mb-6"><h2 className="text-lg font-semibold mb-4">{title}</h2>{children}</div>;
}

function Endpoint({ method, path, desc, body, response }: { method: string; path: string; desc: string; body?: string; response?: string }) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.06)] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${method === "POST" ? "bg-[#30d158]/20 text-[#30d158]" : method === "GET" ? "bg-[#0071E3]/20 text-[#0071E3]" : "bg-[#ff453a]/20 text-[#ff453a]"}`}>{method}</span>
        <code className="text-sm font-mono text-[#f5f5f7]">{path}</code>
      </div>
      <p className="text-sm text-[#98989d] mb-2">{desc}</p>
      {body && <div className="mb-2"><p className="text-xs text-[#636366] mb-1">Request:</p><pre className="rounded-lg bg-[rgba(10,10,15,0.6)] p-3 text-xs font-mono text-[#98989d] overflow-x-auto">{body}</pre></div>}
      {response && <div><p className="text-xs text-[#636366] mb-1">Response:</p><pre className="rounded-lg bg-[rgba(10,10,15,0.6)] p-3 text-xs font-mono text-[#98989d] overflow-x-auto">{response}</pre></div>}
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
            <a href="/spec" className="text-sm text-[#0071E3]">OpenAPI →</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
            <p className="mt-2 text-[#98989d]">Provenance Intelligence System REST API</p>
          </div>
          <a href="/spec" className="flex items-center gap-2 rounded-lg bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0082ff]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
            OpenAPI Spec
          </a>
        </div>
        <p className="text-sm text-[#98989d] mb-8">An OpenAPI 3.1.0 specification is available at <a href="/spec" className="text-[#0071E3] hover:text-[#0082ff]">/spec</a> — import into Postman, Swagger UI, or any API client.</p>

        <Section title="Authentication">
          <p className="text-sm text-[#98989d] mb-4">All API endpoints require authentication via Bearer token in the Authorization header. Tokens can be JWT (user session) or API key (programmatic access).</p>
          <Endpoint method="POST" path="/api/v1/auth/register" desc="Register a new user account"
            body={`{ "email": "user@example.com", "password": "secure-password-123", "name": "Jane Developer" }`}
            response={`{ "token": "eyJ...", "user": { "id": "uuid", "email": "...", "name": "Jane Developer" } }`} />
          <Endpoint method="POST" path="/api/v1/auth/login" desc="Login with email and password"
            body={`{ "email": "user@example.com", "password": "secure-password-123" }`}
            response={`{ "token": "eyJ...", "user": { "id": "uuid", "email": "...", "name": "Jane Developer" } }`} />
          <Endpoint method="POST" path="/api/v1/auth/api-keys" desc="Create a new API key (requires auth)"
            body={`{ "name": "CI/CD Pipeline", "role": "user" }`}
            response={`{ "key": "pv_abc123def456...", "id": "uuid" }`} />
          <div className="rounded-lg bg-[rgba(255,214,10,0.08)] border border-[rgba(255,214,10,0.15)] p-4 mt-4">
            <p className="text-xs text-[#ffd60a] font-medium mb-1">Rate Limiting</p>
            <p className="text-xs text-[#98989d]">API keys are rate-limited to 100 requests per minute per key. Exceeded requests return HTTP 429 with <code className="text-[#ffd60a]">X-RateLimit-Remaining</code> and <code className="text-[#ffd60a]">X-RateLimit-Reset</code> headers.</p>
          </div>
          <div className="rounded-lg bg-[rgba(0,113,227,0.08)] border border-[rgba(0,113,227,0.15)] p-4 mt-3">
            <p className="text-xs text-[#0071E3] font-medium mb-1">API Key Scopes</p>
            <p className="text-xs text-[#98989d] mb-2">Each API key has a scope that controls its permissions:</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="rounded bg-[rgba(0,113,227,0.15)] px-1.5 py-0.5 text-[10px] font-medium text-[#0071E3]">read</span><span className="text-[#98989d]">Query records, lineage, and analytics. Safe for monitoring and CI read-only access.</span></div>
              <div className="flex items-center gap-2"><span className="rounded bg-[rgba(48,209,88,0.15)] px-1.5 py-0.5 text-[10px] font-medium text-[#30d158]">write</span><span className="text-[#98989d]">Create records, deployments, and certificates. For integrations that submit data.</span></div>
              <div className="flex items-center gap-2"><span className="rounded bg-[rgba(255,69,58,0.15)] px-1.5 py-0.5 text-[10px] font-medium text-[#ff453a]">admin</span><span className="text-[#98989d]">Full access including delete. For key management and system administration.</span></div>
            </div>
            <p className="text-xs text-[#98989d] mt-2">Set the scope when creating a key. Scopes are enforced server-side on every request.</p>
          </div>
        </Section>

        <Section title="Provenance Records">
          <Endpoint method="POST" path="/api/v1/records" desc="Create a new provenance record with lineage"
            body={`{ "source_project": "gummy-bear", "source_project_id": "uuid", "user_id": "uuid", "brief": "Build a task manager...", "lineage": [{ "agent_id": "architect", "reasoning": "...", "model_used": "gpt-4o" }] }`}
            response={`{ "id": "uuid", "status": "created" }`} />
          <Endpoint method="POST" path="/api/v1/records/list" desc="List records with optional source filter"
            body={`{ "source": "gummy-bear", "limit": 25, "offset": 0 }`}
            response={`{ "data": [{ "id": "uuid", ... }], "total": 42 }`} />
          <Endpoint method="POST" path="/api/v1/records/get" desc="Get a single record with full lineage, deployments, and certificate"
            body={`{ "id": "uuid" }`}
            response={`{ "id": "uuid", "brief": "...", "lineage": [...], "deployments": [...], "certificate": {...} }`} />
          <Endpoint method="POST" path="/api/v1/records/delete" desc="Delete a record and all associated data" body={`{ "id": "uuid" }`} response={`{ "id": "uuid", "status": "deleted" }`} />
        </Section>

        <Section title="Lineage Tracing">
          <Endpoint method="POST" path="/api/v1/lineage/trace" desc="Trace by content hash (SHA-256)" body={`{ "contentHash": "sha256-abc123..." }`}
            response={`[{ "agent_id": "frontend", "file_path": "frontend/src/App.tsx", "brief": "Build a task manager..." }]`} />
          <Endpoint method="POST" path="/api/v1/lineage/trace-by-file" desc="Trace by file path and optional repo name" body={`{ "filePath": "App.tsx", "repoName": "Grantgazvoda-alt/bitfordge" }`}
            response={`[{ "agent_id": "frontend", "reasoning": "..." }]`} />
        </Section>

        <Section title="Deployments">
          <Endpoint method="POST" path="/api/v1/deployments" desc="Create a deployment record"
            body={`{ "provenance_id": "uuid", "environment": "production", "provider": "vercel", "live_url": "https://my-app.vercel.app", "branch": "main" }`}
            response={`{ "id": "uuid", "status": "deploying" }`} />
          <Endpoint method="POST" path="/api/v1/deployments/list" desc="List deployments, filterable by environment and provider"
            body={`{ "environment": "production", "provider": "vercel" }`}
            response={`{ "data": [...], "total": 10 }`} />
          <Endpoint method="POST" path="/api/v1/deployments/update-status" desc="Update deployment status" body={`{ "id": "uuid", "status": "live", "liveUrl": "https://..." }`} response={`{ "id": "uuid", "status": "live" }`} />
          <Endpoint method="POST" path="/api/v1/deployments/rollback" desc="Rollback a deployment with reason" body={`{ "deploymentId": "uuid", "reason": "Bug in production", "triggeredBy": "manual" }`} response={`{ "id": "uuid", "status": "rolled_back" }`} />
          <Endpoint method="POST" path="/api/v1/deployments/rollbacks" desc="List rollback history" body={`{ "deploymentId": "uuid" }`} response={`[{ "reason": "Bug in production", "triggered_by": "manual", "created_at": "..." }]`} />
        </Section>

        <Section title="Certificates">
          <Endpoint method="POST" path="/api/v1/certificates" desc="Generate an origin certificate" body={`{ "provenanceId": "uuid" }`} response={`{ "id": "uuid", "certificate_data": "{...}" }`} />
          <Endpoint method="POST" path="/api/v1/certificates/verify" desc="Verify a certificate" body={`{ "id": "uuid" }`} response={`{ "valid": true, "certificate": { "id": "uuid", ... } }`} />
        </Section>

        <Section title="Analytics">
          <Endpoint method="POST" path="/api/v1/analytics" desc="Get cross-project analytics" body={`{}`}
            response={`{ "total": 42, "passed": 35, "failed": 7, "deployments": 28, "certificates": 15, "bySource": [{ "source_project": "gummy-bear", "n": 30 }] }`} />
        </Section>

        <Section title="GraphQL">
          <Endpoint method="POST" path="/api/v1/graphql" desc="Execute GraphQL queries and mutations" body={`{ "query": "query { analytics { total passed failed } }" }`} response={`{ "data": { "analytics": { "total": 42, "passed": 35, "failed": 7 } } }`} />
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[#98989d] mb-2">Example Queries:</p>
            <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded">{`{ provenance(id: "uuid") { id brief lineage { agentId filePath } } }`}</pre>
            <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded">{`{ provenances(source: "gummy-bear", limit: 10) { id sourceProject buildStatus } }`}</pre>
            <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded">{`mutation { createRecord(input: { sourceProject: "gummy-bear", ... }) { id status } }`}</pre>
          </div>
        </Section>

        <Section title="Error Codes">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs uppercase tracking-wide text-[#636366]">
                <th className="pb-2 pr-4 font-medium">Code</th><th className="pb-2 pr-4 font-medium">HTTP</th><th className="pb-2 font-medium">Description</th>
              </tr></thead>
              <tbody className="text-[#98989d]">
                <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">validation_error</td><td className="py-2 pr-4">400</td><td className="py-2">Invalid input</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">unauthorized</td><td className="py-2 pr-4">401</td><td className="py-2">Missing or invalid token</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">not_found</td><td className="py-2 pr-4">404</td><td className="py-2">Resource not found</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.03)]"><td className="py-2 pr-4 font-mono">rate_limited</td><td className="py-2 pr-4">429</td><td className="py-2">Rate limit exceeded</td></tr>
                <tr><td className="py-2 pr-4 font-mono">database_unavailable</td><td className="py-2 pr-4">503</td><td className="py-2">Database not available</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Custom Domain">
          <p className="text-sm text-[#98989d] mb-4">The Provenance API is available at the following endpoints:</p>
          <div className="space-y-2 mb-4">
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-3">
              <p className="text-xs font-medium text-[#f5f5f7]">Production API</p>
              <p className="text-xs font-mono text-[#0071E3] mt-1">https://provenance-intel.higgsfield.app</p>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-3">
              <p className="text-xs font-medium text-[#f5f5f7]">API Documentation</p>
              <p className="text-xs font-mono text-[#0071E3] mt-1">https://provenance-intel.higgsfield.app/docs</p>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-3">
              <p className="text-xs font-medium text-[#f5f5f7]">OpenAPI Spec</p>
              <p className="text-xs font-mono text-[#0071E3] mt-1">https://provenance-intel.higgsfield.app/spec</p>
            </div>
          </div>
          <div className="rounded-lg bg-[rgba(255,214,10,0.05)] border border-[rgba(255,214,10,0.15)] p-4">
            <p className="text-xs text-[#ffd60a] font-medium mb-1">DNS Configuration</p>
            <p className="text-xs text-[#98989d] mb-2">To point a custom domain (e.g., api.yourdomain.com) to this API:</p>
            <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded">CNAME  api.yourdomain.com  →  provenance-intel.higgsfield.app</pre>
            <p className="text-xs text-[#98989d] mt-2">Add a CNAME record in your DNS provider pointing to the Provenance app URL. The platform handles TLS termination automatically.</p>
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#ffd60a] font-medium mb-1">Verification</p>
              <p className="text-xs text-[#98989d] mb-2">After adding the DNS record, verify it propagates:</p>
              <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded mb-2">dig api.yourdomain.com CNAME +short
# Expected: provenance-intel.higgsfield.app</pre>
              <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded mb-2">nslookup api.yourdomain.com
# Expected: CNAME provenance-intel.higgsfield.app</pre>
              <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded">curl -I https://api.yourdomain.com/health
# Expected: HTTP/2 200</pre>
              <p className="text-xs text-[#98989d] mt-2">DNS propagation can take 5-30 minutes. TLS certificate provisioning is automatic via the platform.</p>
            </div>
          </div>
        </Section>
        <div className="glass rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">OpenAPI Specification</h2>
          <p className="text-sm text-[#98989d] mb-4">Download the complete OpenAPI 3.1.0 specification for use with your API client.</p>
          <a href="/spec" className="inline-flex items-center gap-2 rounded-lg bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0082ff]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Download OpenAPI Spec
          </a>
        </div>
      </main>
    </div>
  );
}