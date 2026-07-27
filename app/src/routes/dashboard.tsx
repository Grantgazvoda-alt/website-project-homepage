import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [ghData, setGhData] = useState<any>(null);
  const [ghCommits, setGhCommits] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [timings, setTimings] = useState<Record<string, number>>({});

  const projects = [
    { name: "Gummy Bear Command", url: "https://gummy-bear-command.higgsfield.app", slug: "gummy-bear-command", type: "App", desc: "Content studio + 7-agent code generator", tags: ["React", "TanStack", "D1", "R2", "Container"] },
    { name: "StackForge", url: "https://stackforge-builder.higgsfield.app", slug: "stackforge-builder", type: "Website", desc: "Standalone AI full-stack code generator", tags: ["React", "TanStack", "D1", "R2", "JWT"] },
    { name: "Your Potential", url: "https://your-potential.higgsfield.app", slug: "your-potential", type: "Website", desc: "AI-powered business launch platform", tags: ["React", "TanStack", "D1", "Stripe"] },
    { name: "Orgasmo", url: "https://orgasmo.higgsfield.app", slug: "orgasmo", type: "App", desc: "Image generation with GPT Image 2", tags: ["React", "fnf SDK", "D1", "Gen AI"] },
    { name: "Bitfordge Hub", url: "https://provenance-intel.higgsfield.app", slug: "provenance-intel", type: "Website", desc: "This site — project hub and deployment dashboard", tags: ["React", "TanStack", "D1", "GitHub API"] },
  ];

  // Fetch GitHub data
  useEffect(() => {
    fetch("https://api.github.com/repos/Grantgazvoda-alt/website-project-homepage").then(r => r.ok && r.json()).then(d => setGhData(d)).catch(() => {});
    fetch("https://api.github.com/repos/Grantgazvoda-alt/website-project-homepage/commits?per_page=5").then(r => r.ok && r.json()).then(d => setGhCommits(d)).catch(() => {});
  }, []);

  // Ping each site to check if it's up
  useEffect(() => {
    projects.forEach(p => {
      if (!p.url) return;
      const start = Date.now();
      fetch(p.url, { mode: "no-cors" }).then(() => {
        setStatuses(s => ({ ...s, [p.slug]: true }));
        setTimings(t => ({ ...t, [p.slug]: Date.now() - start }));
      }).catch(() => {
        setStatuses(s => ({ ...s, [p.slug]: false }));
      });
    });
  }, []);

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7]">
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
            </div>
            <span className="font-semibold">Bitfordge</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Grantgazvoda-alt/website-project-homepage" target="_blank" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">GitHub</a>
            <Link to="/admin" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">API Keys</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deployment Dashboard</h1>
            <p className="mt-1 text-[#98989d]">Live status monitoring for all your apps</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#30d158] animate-pulse" />
            <span className="text-xs text-[#30d158]">Monitoring {projects.length} sites</span>
          </div>
        </div>

        {/* Live Status Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const status = statuses[p.slug];
            const time = timings[p.slug];
            const isChecking = status === undefined;

            return (
              <div key={p.slug} className="glass rounded-xl p-5 transition hover:border-[rgba(255,255,255,0.15)]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={"size-2 rounded-full " + (isChecking ? "bg-[#ffd60a] animate-pulse" : status ? "bg-[#30d158]" : "bg-[#ff453a]")} />
                      <h2 className="font-semibold">{p.name}</h2>
                    </div>
                    <p className="text-xs text-[#636366] mt-0.5">{p.type}</p>
                  </div>
                  <div className="text-right">
                    <div className={"text-xs font-medium " + (isChecking ? "text-[#ffd60a]" : status ? "text-[#30d158]" : "text-[#ff453a]")}>
                      {isChecking ? "checking..." : status ? "online" : "offline"}
                    </div>
                    {time && <div className="text-[10px] text-[#636366] mt-0.5">{time}ms</div>}
                  </div>
                </div>
                <p className="text-sm text-[#98989d] mb-3">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-[#636366]">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <a href={p.url} target="_blank" className="flex items-center gap-1 rounded-lg bg-[#0071E3] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0082ff]">
                    Open <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                  </a>
                  <span className="text-[10px] text-[#636366]">{p.url?.replace("https://", "")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* GitHub Activity */}
        {ghData && (
          <div className="mt-8 glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z"/></svg>
                <a href="https://github.com/Grantgazvoda-alt/website-project-homepage" target="_blank" className="font-medium hover:text-[#0071E3]">Grantgazvoda-alt/website-project-homepage</a>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#98989d]">
                <span>{ghData.stargazers_count || 0} stars</span>
                <span>{ghData.forks_count || 0} forks</span>
              </div>
            </div>

            {ghCommits.length > 0 && (
              <div className="space-y-2">
                {ghCommits.map((c: any) => (
                  <div key={c.sha} className="flex items-start gap-3 py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                    <div className="mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#98989d] truncate">{c.commit.message.split('\n')[0]}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#636366]">
                        <span>{c.commit.author?.name}</span>
                        <span>{new Date(c.commit.author?.date).toLocaleDateString()}</span>
                        <code className="font-mono">{c.sha.slice(0, 7)}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 glass rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <a href="https://github.com/Grantgazvoda-alt/website-project-homepage" target="_blank" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition hover:bg-[rgba(255,255,255,0.02)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z"/></svg>
              <span className="text-sm">Source Code</span>
              <span className="ml-auto text-xs text-[#636366]">GitHub →</span>
            </a>
            <Link to="/admin" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition hover:bg-[rgba(255,255,255,0.02)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              <span className="text-sm">API Keys</span>
              <span className="ml-auto text-xs text-[#636366]">Manage →</span>
            </Link>
            <a href="https://github.com/Grantgazvoda-alt/website-project-homepage/issues" target="_blank" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition hover:bg-[rgba(255,255,255,0.02)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-sm">Report Issue</span>
              <span className="ml-auto text-xs text-[#636366]">GitHub Issues →</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}