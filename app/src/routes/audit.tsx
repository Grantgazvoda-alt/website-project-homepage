import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAuditLogsFn } from "../lib/audit.functions";

export const Route = createFileRoute("/audit")({
  component: AuditPage,
});

function AuditPage() {
  const [filterType, setFilterType] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["provenance", "audit", filterType, filterTarget, page],
    queryFn: () => listAuditLogsFn({
      data: {
        targetType: filterType || undefined,
        targetId: filterTarget || undefined,
        limit: perPage,
        offset: page * perPage,
      },
    }),
  });

  const logs = (data as any[]) ?? [];

  const actionColors: Record<string, string> = {
    scope_update: "bg-[rgba(0,113,227,0.15)] text-[#0071E3]",
    key_delete: "bg-[rgba(255,69,58,0.15)] text-[#ff453a]",
    key_create: "bg-[rgba(48,209,88,0.15)] text-[#30d158]",
  };

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
            <Link to="/dashboard" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Dashboard</Link>
            <Link to="/admin" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Admin</Link>
            <Link to="/docs" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">API Docs</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
            <p className="mt-1 text-[#98989d]">Track all scope changes, key deletions, and admin actions</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="text" value={filterTarget} onChange={(e) => setFilterTarget(e.target.value)}
              placeholder="Filter by target ID..."
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-3 py-2 text-xs text-[#f5f5f7] outline-none transition focus:border-[#0071E3] w-48" />
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-3 py-2 text-xs text-[#f5f5f7] outline-none">
              <option value="">All types</option>
              <option value="api_key">API Keys</option>
              <option value="provenance_records">Records</option>
              <option value="deployment">Deployments</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-[#98989d]">No audit log entries found</p>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.4)] text-left text-xs uppercase tracking-wide text-[#98989d]">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Old Value</th>
                  <th className="px-4 py-3 font-medium">New Value</th>
                  <th className="px-4 py-3 font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-[rgba(255,255,255,0.03)] transition hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-4 py-3 text-xs text-[#636366] whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at + "Z").toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#98989d]">{log.actor_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"rounded px-2 py-0.5 text-[10px] font-medium " + (actionColors[log.action] || "bg-[rgba(255,255,255,0.1)] text-[#98989d]")}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#98989d]">{log.target_type}</span>
                      <br />
                      <span className="font-mono text-[10px] text-[#636366]">{log.target_id?.slice(0, 12)}...</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#636366] max-w-[120px] truncate">{log.old_value || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#0071E3] max-w-[120px] truncate">{log.new_value || "—"}</td>
                    <td className="px-4 py-3 text-[10px] text-[#636366] max-w-[150px] truncate" title={log.metadata}>{log.metadata || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-4 py-3">
              <span className="text-xs text-[#636366]">Page {page + 1}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                  className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30">Previous</button>
                <button onClick={() => setPage(page + 1)} disabled={logs.length < perPage}
                  className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30">Next</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Audit Log Summary</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[rgba(0,113,227,0.2)] bg-[rgba(0,113,227,0.05)] p-4">
              <p className="text-xs font-medium text-[#0071E3] mb-1">Scope Updates</p>
              <p className="text-[10px] text-[#98989d]">Tracked when API key scopes are changed. Records the actor, old scope, and new scope.</p>
            </div>
            <div className="rounded-lg border border-[rgba(255,69,58,0.2)] bg-[rgba(255,69,58,0.05)] p-4">
              <p className="text-xs font-medium text-[#ff453a] mb-1">Key Deletions</p>
              <p className="text-[10px] text-[#98989d]">Tracked when API keys are deleted. Records the actor and previous key configuration.</p>
            </div>
            <div className="rounded-lg border border-[rgba(48,209,88,0.2)] bg-[rgba(48,209,88,0.05)] p-4">
              <p className="text-xs font-medium text-[#30d158] mb-1">Full Traceability</p>
              <p className="text-[10px] text-[#98989d]">Every administrative action is logged with timestamp, actor ID, and before/after values.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}