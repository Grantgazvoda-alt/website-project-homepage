import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsFn, listRecordsFn } from "../lib/provenance.functions";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
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
            <Link to="/records" className="text-sm font-medium text-[#0071E3]">Records</Link>
            <Link to="/graphql" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">GraphQL</Link>
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
            <div className="mt-2 text-3xl font-bold">
              {a.total > 0 ? Math.round((a.passed / a.total) * 100) + "%" : "—"}
            </div>
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

        {a.bySource && a.bySource.length > 0 && (
          <div className="mt-6 glass rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Records by Source</h3>
            <div className="flex gap-4">
              {a.bySource.map((s: any) => (
                <div key={s.source_project} className="flex items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.03)] px-4 py-3">
                  <span className="rounded-full bg-[rgba(0,113,227,0.1)] px-2 py-0.5 text-xs text-[#0071E3]">{s.source_project}</span>
                  <span className="text-lg font-bold">{s.n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {records.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Records</h2>
              <Link to="/records" className="text-sm text-[#0071E3] hover:text-[#0082ff]">View all →</Link>
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
                      <td className="px-4 py-3">
                        <Link to="/records/$recordId" params={{ recordId: r.id }} className="font-medium text-[#0071E3] hover:text-[#0082ff]">{r.source_project}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs ${r.build_status === "passed" ? "text-[#30d158]" : r.build_status === "failed" ? "text-[#ff453a]" : "text-[#636366]"}`}>
                          <span className={`size-1.5 rounded-full ${r.build_status === "passed" ? "bg-[#30d158]" : r.build_status === "failed" ? "bg-[#ff453a]" : "bg-[#636366]"}`} />
                          {r.build_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#98989d]">{r.file_count || 0}</td>
                      <td className="px-4 py-3 text-[#98989d] font-mono text-xs">{r.model_used || "—"}</td>
                      <td className="px-4 py-3 text-[#636366] text-xs">{r.created_at ? new Date(r.created_at + "Z").toLocaleDateString() : "—"}</td>
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
            <p className="mt-2 text-[#98989d] max-w-lg mx-auto">Connect StackForge or Gummy Bear to start recording code generation lineage, deployment tracking, and origin certificates.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/records" className="rounded-lg bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0082ff]">View Records</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}