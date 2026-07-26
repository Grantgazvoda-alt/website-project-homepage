import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRecordFn, traceLineageFn } from "../lib/provenance.functions";

export const Route = createFileRoute("/records/$recordId")({
  component: RecordDetailPage,
});

function RecordDetailPage() {
  const { recordId } = Route.useParams();

  const { data: record, isLoading } = useQuery({
    queryKey: ["provenance", "record", recordId],
    queryFn: () => getRecordFn({ data: { id: recordId } }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <p className="text-[#98989d]">Record not found</p>
        <Link to="/records" className="text-[#0071E3]">Back to records</Link>
      </div>
    );
  }

  const r = record as any;

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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link to="/records" className="inline-flex items-center gap-1 text-sm text-[#98989d] hover:text-[#f5f5f7] mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to records
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Provenance Record</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Source</span>
                  <p className="mt-1 text-sm font-medium">{r.source_project}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Source Project ID</span>
                  <p className="mt-1 text-sm font-mono text-[#98989d]">{r.source_project_id}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Tech Stack</span>
                  <p className="mt-1 text-sm">{r.tech_stack || "--"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Model Used</span>
                  <p className="mt-1 text-sm font-mono text-[#0071E3]">{r.model_used || "--"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Build Status</span>
                  <p className={`mt-1 text-sm font-medium ${r.build_status === "passed" ? "text-[#30d158]" : r.build_status === "failed" ? "text-[#ff453a]" : "text-[#98989d]"}`}>{r.build_status}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Version</span>
                  <p className="mt-1 text-sm">v{r.version_number || 0}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Files</span>
                  <p className="mt-1 text-sm">{r.file_count || 0}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Total Lines</span>
                  <p className="mt-1 text-sm">{(r.total_lines || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Created</span>
                  <p className="mt-1 text-sm text-[#98989d]">{r.created_at ? new Date(r.created_at + "Z").toLocaleString() : "--"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-[#636366]">Fix Rounds</span>
                  <p className="mt-1 text-sm">{r.fix_rounds || 0}</p>
                </div>
              </div>
            </div>

            {/* Brief */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-3">Original Brief</h3>
              <p className="text-sm text-[#98989d] leading-relaxed whitespace-pre-wrap">{r.brief || "--"}</p>
            </div>

            {/* Architecture Plan */}
            {r.architecture_plan && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-3">Architecture Plan</h3>
                <p className="text-sm text-[#98989d] leading-relaxed whitespace-pre-wrap">{r.architecture_plan}</p>
              </div>
            )}

            {/* Lineage Tree */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Agent Lineage ({r.lineage?.length || 0} entries)</h3>
              {(!r.lineage || r.lineage.length === 0) ? (
                <p className="text-sm text-[#636366]">No lineage data recorded</p>
              ) : (
                <div className="space-y-3">
                  {r.lineage.map((entry: any, i: number) => (
                    <div key={entry.id || i} className="relative flex gap-4">
                      {/* Connector line */}
                      {i < r.lineage.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-[rgba(255,255,255,0.08)]" />
                      )}
                      {/* Node */}
                      <div className="flex flex-col items-center">
                        <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                          entry.agent_id === "architect" ? "bg-[#A78BFA]/20 text-[#A78BFA]"
                          : entry.agent_id === "frontend" ? "bg-[#60A5FA]/20 text-[#60A5FA]"
                          : entry.agent_id === "backend" ? "bg-[#34D399]/20 text-[#34D399]"
                          : entry.agent_id === "database" ? "bg-[#FBBF24]/20 text-[#FBBF24]"
                          : entry.agent_id === "api" ? "bg-[#F472B6]/20 text-[#F472B6]"
                          : entry.agent_id === "devops" ? "bg-[#22D3EE]/20 text-[#22D3EE]"
                          : entry.agent_id === "reviewer" ? "bg-[#D9FF2E]/20 text-[#D9FF2E]"
                          : "bg-[rgba(255,255,255,0.1)] text-[#98989d]"
                        }`}>
                          {entry.agent_id[0].toUpperCase()}
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{entry.agent_id} Agent</span>
                          {entry.model_used && <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 text-[10px] text-[#636366]">{entry.model_used}</span>}
                          {entry.duration_ms > 0 && <span className="text-[10px] text-[#636366]">{(entry.duration_ms / 1000).toFixed(1)}s</span>}
                        </div>
                        {entry.file_path && <p className="mt-1 text-xs font-mono text-[#0071E3]">{entry.file_path}</p>}
                        {entry.reasoning && <p className="mt-1 text-xs text-[#98989d] leading-relaxed">{entry.reasoning.slice(0, 300)}</p>}
                        {entry.content_hash && (
                          <div className="mt-1">
                            <span className="text-[10px] text-[#636366] font-mono">SHA-256: {entry.content_hash.slice(0, 16)}...</span>
                          </div>
                        )}
                        {entry.error_message && <p className="mt-1 text-xs text-[#ff453a]">{entry.error_message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* GitHub */}
            {r.repo_url && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-xs uppercase tracking-wide text-[#636366] mb-3">Repository</h3>
                <a href={r.repo_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#0071E3] hover:text-[#0082ff]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" /></svg>
                  {r.repo_name || r.repo_url}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                </a>
                {r.commit_hash && <p className="mt-2 text-xs font-mono text-[#636366]">{r.commit_hash.slice(0, 12)}</p>}
              </div>
            )}

            {/* Deployments */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-xs uppercase tracking-wide text-[#636366] mb-3">Deployments ({(r.deployments as any[])?.length || 0})</h3>
              {(!r.deployments || r.deployments.length === 0) ? (
                <p className="text-xs text-[#636366]">No deployments</p>
              ) : (
                <div className="space-y-2">
                  {r.deployments.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.03)] p-2.5">
                      <div>
                        <p className="text-xs font-medium capitalize">{d.environment}</p>
                        <p className="text-[10px] text-[#636366]">{d.provider}</p>
                      </div>
                      <div className="text-right">
                        {d.live_url ? (
                          <a href={d.live_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-[#30d158] hover:underline">
                            Live <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                          </a>
                        ) : (
                          <span className={`text-[10px] ${d.status === "live" ? "text-[#30d158]" : d.status === "failed" ? "text-[#ff453a]" : "text-[#636366]"}`}>{d.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certificate */}
            {r.certificate && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-xs uppercase tracking-wide text-[#636366] mb-3">Origin Certificate</h3>
                <div className="rounded-lg bg-[rgba(48,209,88,0.1)] border border-[rgba(48,209,88,0.2)] p-3">
                  <p className="flex items-center gap-1.5 text-xs text-[#30d158]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Valid Certificate
                  </p>
                  <p className="mt-1 text-[10px] text-[#636366] font-mono">{r.certificate.id}</p>
                </div>
              </div>
            )}

            {/* Pipeline Info */}
            {r.pipeline_duration_ms > 0 && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-xs uppercase tracking-wide text-[#636366] mb-3">Pipeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#98989d]">Duration</span><span>{(r.pipeline_duration_ms / 1000).toFixed(1)}s</span></div>
                  <div className="flex justify-between"><span className="text-[#98989d]">Fix Rounds</span><span>{r.fix_rounds || 0}</span></div>
                  <div className="flex justify-between"><span className="text-[#98989d]">Test Status</span><span className={r.test_status === "passed" ? "text-[#30d158]" : r.test_status === "failed" ? "text-[#ff453a]" : ""}>{r.test_status}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}