import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsFn, listRecordsFn } from "../lib/provenance.functions";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyScope, setApiKeyScope] = useState("read");
  const [apiKeyResult, setApiKeyResult] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);

  const { data: analytics } = useQuery({
    queryKey: ["provenance", "analytics"],
    queryFn: () => getAnalyticsFn(),
  });

  const { data: recent } = useQuery({
    queryKey: ["provenance", "recent"],
    queryFn: () => listRecordsFn({ data: { limit: 5, offset: 0 } }),
  });

  const a = (analytics as any) ?? {};
  const records = (recent as any)?.data ?? [];

  const handleCreateApiKey = async () => {
    if (!apiKeyName.trim()) return;
    setCreatingKey(true);
    setApiKeyError(null);
    setApiKeyResult(null);
    try {
      const { createApiKeyFn } = await import("../lib/auth.functions");
      const result = await createApiKeyFn({ data: { name: apiKeyName.trim(), role: apiKeyScope === "admin" ? "admin" : "user", scopes: apiKeyScope } });
      setApiKeyResult("Key created: " + (result as any).key);
      setApiKeyName("");
    } catch (e) {
      setApiKeyError(e instanceof Error ? e.message : "Failed to create API key");
    } finally {
      setCreatingKey(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const scopes = [
    { id: "read", label: "Read Only", desc: "Query records and lineage" },
    { id: "write", label: "Read & Write", desc: "Create records and deployments" },
    { id: "admin", label: "Admin", desc: "Full access including delete" },
  ];

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7]">
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
            </div>
            <span className="font-semibold">Provenance</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/records" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Records</Link>
            <Link to="/docs" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">API Docs</Link>
            <Link to="/spec" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">OpenAPI</Link>
            <Link to="/admin" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Admin</Link>
            <Link to="/audit" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Audit</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[#98989d]">Provenance Intelligence System — code lineage, deployment tracking, and origin certificates</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/records" className="glass rounded-xl p-5 transition hover:border-[rgba(0,113,227,0.3)]">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Total Records</div>
            <div className="mt-2 text-3xl font-bold">{a.total ?? 0}</div>
            <p className="mt-1 text-xs text-[#636366]">Generation lineage records</p>
          </Link>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Build Success Rate</div>
            <div className="mt-2 text-3xl font-bold">{a.total > 0 ? Math.round((a.passed / a.total) * 100) + "%" : "—"}</div>
            <p className="mt-1 flex items-center gap-2 text-xs text-[#636366]">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#30d158]" /> {a.passed} passed</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#ff453a]" /> {a.failed} failed</span>
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Deployments</div>
            <div className="mt-2 text-3xl font-bold">{a.deployments ?? 0}</div>
            <p className="mt-1 text-xs text-[#636366]">Tracked across all environments</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Certificates</div>
            <div className="mt-2 text-3xl font-bold">{a.certificates ?? 0}</div>
            <p className="mt-1 text-xs text-[#636366]">Origin certificates issued</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="/api/v1/export-pdf" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-4 transition hover:bg-[rgba(255,255,255,0.02)]">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(0,113,227,0.1)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium">Download API Docs</p>
                <p className="text-xs text-[#98989d]">PDF-optimized HTML export</p>
              </div>
            </a>
            <a href="/audit" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-4 transition hover:bg-[rgba(255,255,255,0.02)]">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(255,214,10,0.1)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium">View Audit Log</p>
                <p className="text-xs text-[#98989d]">Scope changes and admin actions</p>
              </div>
            </a>
            <a href="/admin" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-4 transition hover:bg-[rgba(255,255,255,0.02)]">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(48,209,88,0.1)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium">Admin Console</p>
                <p className="text-xs text-[#98989d]">API key management and scopes</p>
              </div>
            </a>
          </div>
          <div className="mt-4 flex items-center gap-4 rounded-lg bg-[rgba(10,10,15,0.4)] p-3">
            <img src="/coverage-badge.svg" alt="Test Coverage" className="h-5" />
            <span className="text-xs text-[#636366]">100+ tests across 32 categories — <a href="/spec" className="text-[#0071E3] hover:text-[#0082ff]">run coverage report</a></span>
          </div>
        </div>

        {/* API Key Management */}
        <div className="mt-8 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">API Keys</h2>
            <button onClick={() => { setShowApiKeyModal(true); setApiKeyResult(null); setApiKeyError(null); }}
              className="rounded-lg bg-[#0071E3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0082ff]">
              + Create New Key
            </button>
          </div>
          <p className="text-sm text-[#98989d] mb-4">
            API keys allow programmatic access to the Provenance API. Use them in the{' '}
            <code className="font-mono text-xs bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 rounded">Authorization: Bearer &lt;key&gt;</code> header.
          </p>
          <div className="rounded-lg bg-[rgba(255,214,10,0.05)] border border-[rgba(255,214,10,0.15)] p-4 mb-4">
            <p className="text-xs text-[#ffd60a] font-medium mb-1">Rate Limits</p>
            <p className="text-xs text-[#98989d]">API keys are rate-limited to 100 requests per minute. Scopes control what each key can do.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#636366]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            <span>No API keys created yet — click "Create New Key" to generate one. <Link to="/admin" className="text-[#0071E3] hover:text-[#0082ff]">Manage keys →</Link></span>
          </div>
        </div>

        {/* API Key Creation Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowApiKeyModal(false)}>
            <div className="mx-4 w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(18,18,26,0.95)] p-6 shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold">Create API Key</h2>
              <p className="mt-1 text-sm text-[#98989d]">Generate a new key for programmatic access.</p>
              {!apiKeyResult ? (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-[#98989d] mb-2">Key Name</label>
                  <input type="text" value={apiKeyName} onChange={(e) => setApiKeyName(e.target.value)}
                    placeholder="e.g. CI/CD Pipeline, StackForge Integration"
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-4 py-3 text-sm text-[#f5f5f7] outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]" />
                  <label className="block text-sm font-medium text-[#98989d] mt-4 mb-2">Key Scope</label>
                  <div className="grid grid-cols-3 gap-2">
                    {scopes.map((s) => (
                      <button key={s.id} onClick={() => setApiKeyScope(s.id)}
                        className={`rounded-lg border p-3 text-left transition ${
                          apiKeyScope === s.id
                            ? "border-[#0071E3] bg-[rgba(0,113,227,0.1)]"
                            : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                        }`}>
                        <p className="text-xs font-medium">{s.label}</p>
                        <p className="text-[10px] text-[#636366] mt-0.5">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                  {apiKeyError && <p className="mt-2 text-sm text-[#ff453a]">{apiKeyError}</p>}
                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setShowApiKeyModal(false)}
                      className="rounded-lg border border-[rgba(255,255,255,0.1)] px-5 py-2.5 text-sm font-medium text-[#98989d] transition hover:bg-[rgba(255,255,255,0.05)]">Cancel</button>
                    <button onClick={handleCreateApiKey} disabled={creatingKey || !apiKeyName.trim()}
                      className="rounded-lg bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0082ff] disabled:opacity-50">
                      {creatingKey ? "Creating..." : "Create Key"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="rounded-lg bg-[rgba(48,209,88,0.1)] border border-[rgba(48,209,88,0.2)] p-4">
                    <p className="text-sm text-[#30d158] font-medium mb-1">Key Created Successfully</p>
                    <p className="text-xs text-[#98989d] mb-2">Copy this key now. You won't be able to see it again.</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-[rgba(10,10,15,0.8)] px-3 py-2 text-xs font-mono text-[#f5f5f7] break-all">{apiKeyResult}</code>
                      <button onClick={() => copyToClipboard(apiKeyResult!)}
                        className="shrink-0 rounded-lg bg-[#0071E3] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#0082ff]">Copy</button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => { setShowApiKeyModal(false); setApiKeyResult(null); }}
                      className="rounded-lg bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0082ff]">Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Start */}
        <div className="mt-6 glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { n: "1", title: "Create an API key", desc: "Generate a scoped key above.", code: `POST /api/v1/auth/api-keys\nAuthorization: Bearer <token>\n{ "name": "CI/CD", "role": "user" }` },
              { n: "2", title: "Submit provenance records", desc: "Send generation data from your code generator.", code: `POST /api/v1/records\nAuthorization: Bearer <api-key>\n{ "source_project": "gummy-bear", ... }` },
              { n: "3", title: "Track deployments", desc: "Record where and when code was deployed.", code: `POST /api/v1/deployments\nAuthorization: Bearer <api-key>\n{ "provenance_id": "uuid", ... }` },
              { n: "4", title: "Verify lineage", desc: "Trace files back to their origin.", code: `POST /api/v1/lineage/trace\nAuthorization: Bearer <api-key>\n{ "contentHash": "sha256-..." }` },
            ].map((item) => (
              <div key={item.n} className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0071E3]/20 text-xs font-bold text-[#0071E3]">{item.n}</span>
                  <h3 className="text-sm font-medium">{item.title}</h3>
                </div>
                <p className="text-xs text-[#98989d] mb-2">{item.desc}</p>
                <pre className="text-xs font-mono text-[#98989d] bg-[rgba(10,10,15,0.6)] p-2 rounded"><code>{item.code}</code></pre>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Records */}
        {records.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Records</h2>
              <Link to="/records" className="text-sm text-[#0071E3] hover:text-[#0082ff]">View all &rarr;</Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.4)] text-left text-xs uppercase tracking-wide text-[#98989d]">
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Build</th>
                    <th className="px-4 py-3 font-medium">Files</th>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any) => (
                    <tr key={r.id} className="border-b border-[rgba(255,255,255,0.03)] transition hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="px-4 py-3"><Link to={"/records/" + r.id} className="font-medium text-[#0071E3] hover:text-[#0082ff]">{r.source_project}</Link></td>
                      <td className="px-4 py-3">
                        <span className={"flex items-center gap-1 text-xs " + (r.build_status === "passed" ? "text-[#30d158]" : r.build_status === "failed" ? "text-[#ff453a]" : "text-[#636366]")}>
                          <span className={"size-1.5 rounded-full " + (r.build_status === "passed" ? "bg-[#30d158]" : r.build_status === "failed" ? "bg-[#ff453a]" : "bg-[#636366]")} />
                          {r.build_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#98989d]">{r.file_count || 0}</td>
                      <td className="px-4 py-3 text-[#98989d] font-mono text-xs">{r.model_used || "\u2014"}</td>
                      <td className="px-4 py-3 text-[#636366] text-xs">{r.created_at ? new Date(r.created_at + "Z").toLocaleDateString() : "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-8 glass rounded-xl p-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,113,227,0.1)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold">No provenance records yet</h2>
            <p className="mt-2 text-[#98989d] max-w-lg mx-auto">Connect StackForge or Gummy Bear to start recording.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/records" className="rounded-lg bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0082ff]">View Records</Link>
              <Link to="/docs" className="rounded-lg border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-medium text-[#98989d] transition hover:bg-[rgba(255,255,255,0.05)]">API Documentation</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}