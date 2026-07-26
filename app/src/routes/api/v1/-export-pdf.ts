// Server-side PDF export — generates a print-optimized HTML document
// Browser can save as PDF via the print dialog
import { createServerFn } from "@tanstack/react-start";

const htmlTemplate = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Provenance API Documentation</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; line-height: 1.6; }
  h1 { font-size: 28px; border-bottom: 2px solid #0071E3; padding-bottom: 10px; }
  h2 { font-size: 20px; margin-top: 30px; color: #0071E3; }
  h3 { font-size: 16px; margin-top: 20px; }
  pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
  code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 14px; }
  th { background: #f5f5f5; }
  .endpoint { margin: 15px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; }
  .method { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: white; margin-right: 8px; }
  .method-post { background: #30d158; }
  .method-get { background: #0071E3; }
  .method-delete { background: #ff453a; }
  .scope-read { color: #0071E3; font-weight: bold; }
  .scope-write { color: #30d158; font-weight: bold; }
  .scope-admin { color: #ff453a; font-weight: bold; }
  @media print { body { padding: 0; } }
</style></head>
<body>${content}</body></html>`;

const docsContent = `
<h1>Provenance Intelligence System API</h1>
<p>REST API for code lineage tracking, deployment provenance, and origin certificates.</p>
<p>Server: https://provenance-intel.higgsfield.app</p>

<h2>Authentication</h2>
<p>All API endpoints require authentication via Bearer token in the Authorization header.</p>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/auth/register</h3>
  <p>Register a new user account.</p>
  <pre>{ "email": "user@example.com", "password": "secure-password-123", "name": "Jane Developer" }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/auth/login</h3>
  <p>Login with email and password.</p>
  <pre>{ "email": "user@example.com", "password": "secure-password-123" }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/auth/api-keys</h3>
  <p>Create a new API key with a specific scope.</p>
  <pre>{ "name": "CI/CD Pipeline", "role": "user", "scopes": "read" }</pre>
</div>

<h3>API Key Scopes</h3>
<table>
  <tr><th>Scope</th><th>Permissions</th><th>Use Case</th></tr>
  <tr><td class="scope-read">read</td><td>Query records, lineage, analytics</td><td>Monitoring, CI read-only</td></tr>
  <tr><td class="scope-write">write</td><td>Create records, deployments, certificates</td><td>Integrations that submit data</td></tr>
  <tr><td class="scope-admin">admin</td><td>Full access including delete</td><td>Key management, administration</td></tr>
</table>

<h2>Provenance Records</h2>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/records</h3>
  <p>Create a new provenance record with lineage entries.</p>
  <pre>{ "source_project": "gummy-bear", "source_project_id": "uuid", "user_id": "uuid", "brief": "Build a task manager...", "lineage": [{ "agent_id": "architect", "reasoning": "...", "model_used": "gpt-4o" }] }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/records/list</h3>
  <p>List records with optional source filter.</p>
  <pre>{ "source": "gummy-bear", "limit": 25, "offset": 0 }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/records/get</h3>
  <p>Get a single record with full lineage, deployments, and certificate.</p>
  <pre>{ "id": "uuid" }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/records/delete</h3>
  <p>Delete a record and all associated data.</p>
  <pre>{ "id": "uuid" }</pre>
</div>

<h2>Lineage Tracing</h2>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/lineage/trace</h3>
  <p>Trace a file by its SHA-256 content hash back to its origin.</p>
  <pre>{ "contentHash": "sha256-abc123..." }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/lineage/trace-by-file</h3>
  <p>Trace a file by its path and optional repo name.</p>
  <pre>{ "filePath": "App.tsx", "repoName": "Grantgazvoda-alt/bitfordge" }</pre>
</div>

<h2>Deployments</h2>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/deployments</h3>
  <p>Create a deployment record.</p>
  <pre>{ "provenance_id": "uuid", "environment": "production", "provider": "vercel", "live_url": "https://my-app.vercel.app" }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/deployments/list</h3>
  <p>List deployments, filterable by environment and provider.</p>
  <pre>{ "environment": "production", "provider": "vercel" }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/deployments/rollback</h3>
  <p>Rollback a deployment.</p>
  <pre>{ "deploymentId": "uuid", "reason": "Bug in production", "triggeredBy": "manual" }</pre>
</div>

<h2>Certificates</h2>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/certificates</h3>
  <p>Generate an origin certificate for a provenance record.</p>
  <pre>{ "provenanceId": "uuid" }</pre>
</div>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/certificates/verify</h3>
  <p>Verify a certificate.</p>
  <pre>{ "id": "uuid" }</pre>
</div>

<h2>Analytics</h2>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/analytics</h3>
  <p>Get cross-project analytics overview.</p>
  <pre>{}</pre>
</div>

<h2>GraphQL</h2>
<div class="endpoint">
  <h3><span class="method method-post">POST</span> /api/v1/graphql</h3>
  <p>Execute GraphQL queries and mutations.</p>
  <pre>{ "query": "query { analytics { total passed failed } }" }</pre>
</div>

<h2>Error Codes</h2>
<table>
  <tr><th>Code</th><th>HTTP</th><th>Description</th></tr>
  <tr><td>validation_error</td><td>400</td><td>Invalid input</td></tr>
  <tr><td>unauthorized</td><td>401</td><td>Missing or invalid token</td></tr>
  <tr><td>not_found</td><td>404</td><td>Resource not found</td></tr>
  <tr><td>rate_limited</td><td>429</td><td>Rate limit exceeded</td></tr>
  <tr><td>database_unavailable</td><td>503</td><td>Database not available</td></tr>
</table>

<h2>Custom Domain Setup</h2>
<p>To point a custom domain to this API:</p>
<pre>CNAME  api.yourdomain.com  →  provenance-intel.higgsfield.app</pre>
<p>Verify with:</p>
<pre>dig api.yourdomain.com CNAME +short
curl -I https://api.yourdomain.com/health</pre>
`;

export const getPdfExport = createServerFn({ method: "GET" }).handler(() => {
  const html = htmlTemplate(docsContent);
  return new Response(html, {
    headers: {
      "content-type": "text/html",
      "content-disposition": "attachment; filename=provenance-api-docs.html",
    },
  });
});