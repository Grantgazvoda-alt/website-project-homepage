import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listRecordsFn, getAnalyticsFn } from "../lib/provenance.functions";

export const Route = createFileRoute("/records")({
  component: RecordsPage,
});

function RecordsPage() {
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["provenance", "records", sourceFilter, page],
    queryFn: () => listRecordsFn({ data: { source: sourceFilter || undefined, limit: perPage, offset: page * perPage } }),
  });

  const { data: analytics } = useQuery({
    queryKey: ["provenance", "analytics"],
    queryFn: () => getAnalyticsFn(),
  });

  const records = (data as any)?.data ?? [];
  const total = (data as any)?.total ?? 0;
  const totalPages = Math.ceil(total / perPage);

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
            <Link to="/records" className="text-sm font-medium text-[#0071E3]">Records</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Provenance Records</h1>
            <p className="mt-1 text-sm text-[#98989d]">{total} total records -- code generation lineage and deployment history</p>
          </div>
          <div className="flex items-center gap-3">
            {analytics && (
              <div className="flex items-center gap-3 text-xs text-[#98989d]">
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#30d158]" /> {(analytics as any).passed} passed</span>
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#ff453a]" /> {(analytics as any).failed} failed</span>
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#0071E3]" /> {(analytics as any).deployments} deploys</span>
              </div>
            )}
            <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(0); }}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-3 py-2 text-sm text-[#f5f5f7] outline-none">
              <option value="">All sources</option>
              <option value="stackforge">StackForge</option>
              <option value="gummy-bear">Gummy Bear</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="mt-8 glass rounded-xl py-20 text-center">
            <p className="text-[#98989d]">No provenance records yet. Integrate StackForge or Gummy Bear to generate data.</p><button onClick={async () => { const { seedFn } = await import("../routes/api/v1/-seed"); const result = await seedFn(); alert("Created " + result.created + " sample records. Refresh to see them."); window.location.reload(); }} className="rounded-lg bg-[#0071E3] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#0082ff]">Seed Sample Data</button>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.4)] text-left text-xs uppercase tracking-wide text-[#98989d]">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Build</th>
                  <th className="px-4 py-3 font-medium">Files</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Deploy</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => (
                  <tr key={r.id} className="border-b border-[rgba(255,255,255,0.03)] transition hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-4 py-3">
                      <Link to="/records/$recordId" params={{ recordId: r.id }} className="font-medium text-[#0071E3] hover:text-[#0082ff]">
                        {r.source_project_id?.slice(0, 8) || "--"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[rgba(0,113,227,0.1)] px-2 py-0.5 text-xs text-[#0071E3]">{r.source_project}</span>
                    </td>
                    <td className="px-4 py-3 text-[#98989d]">v{r.version_number || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs ${r.build_status === "passed" ? "text-[#30d158]" : r.build_status === "failed" ? "text-[#ff453a]" : "text-[#636366]"}`}>
                        <span className={`size-1.5 rounded-full ${r.build_status === "passed" ? "bg-[#30d158]" : r.build_status === "failed" ? "bg-[#ff453a]" : "bg-[#636366]"}`} />
                        {r.build_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#98989d]">{r.file_count || 0}</td>
                    <td className="px-4 py-3 text-[#98989d] font-mono text-xs">{r.model_used || "No data"}</td>
                    <td className="px-4 py-3 text-[#98989d]">{r.deployments ?? "--"}</td>
                    <td className="px-4 py-3 text-[#636366] text-xs">{r.created_at ? new Date(r.created_at + "Z").toLocaleDateString() : "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-4 py-3">
                <span className="text-xs text-[#636366]">Page {page + 1} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30">Previous</button>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}