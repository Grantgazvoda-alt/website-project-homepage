import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [ghData, setGhData] = useState<any>(null);
  const [ghIssues, setGhIssues] = useState<any[]>([]);
  const [ghCommits, setGhCommits] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://api.github.com/repos/Grantgazvoda-alt/bitfordge").then(r => r.ok && r.json()).then(d => setGhData(d)).catch(() => {});
    fetch("https://api.github.com/repos/Grantgazvoda-alt/bitfordge/issues?state=open&per_page=5").then(r => r.ok && r.json()).then(d => setGhIssues(d)).catch(() => {});
    fetch("https://api.github.com/repos/Grantgazvoda-alt/bitfordge/commits?per_page=5").then(r => r.ok && r.json()).then(d => setGhCommits(d)).catch(() => {});
  }, []);

  const projects = [
    { name: "Gummy Bear Command", url: "https://gummy-bear-command.higgsfield.app", slug: "gummy-bear-command", type: "App", status: "live", color: "#30d158", desc: "Content studio + 7-agent code generator", tags: ["React", "TanStack", "D1", "R2", "Container"] },
    { name: "StackForge", url: "https://stackforge-builder.higgsfield.app", slug: "stackforge-builder", type: "Website", status: "live", color: "#30d158", desc: "Standalone AI full-stack code generator", tags: ["React", "TanStack", "D1", "R2", "JWT"] },
    { name: "Your Potential", url: "https://your-potential.higgsfield.app", slug: "your-potential", type: "Website", status: "live", color: "#30d158", desc: "AI-powered business launch platform", tags: ["React", "TanStack", "D1", "Stripe"] },
    { name: "Orgasmo", url: "https://orgasmo.higgsfield.app", slug: "orgasmo", type: "App", status: "live", color: "#30d158", desc: "Image generation with GPT Image 2", tags: ["React", "fnf SDK", "D1", "Gen AI"] },
    { name: "Omni Reason", url: null, slug: "omni-reason", type: "App", status: "draft", color: "#636366", desc: "Multi-reasoning AI platform", tags: ["Not deployed"] },
  ];

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
            <Link to="/admin" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">API Keys</Link>
            <Link to="/docs" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">API Docs</Link>
            <a href="https://github.com/Grantgazvoda-alt/bitfordge" target="_blank" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">GitHub</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Hub</h1>
            <p className="mt-1 text-[#98989d]">5 projects across your portfolio</p>
          </div>
          <div className="flex items-center gap-3">
            <img src="https://img.shields.io/github/last-commit/Grantgazvoda-alt/bitfordge?label=updated&color=0071E3" className="h-5" />
          </div>
        </div>

        {/* GitHub Stats */}
        {ghData && (
          <div className="mt-6 glass rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" /></svg>
                <div>
                  <a href="https://github.com/Grantgazvoda-alt/bitfordge" target="_blank" className="font-medium hover:text-[#0071E3]">Grantgazvoda-alt/bitfordge</a>
                  <p className="text-xs text-[#636366]">{ghData.description || "Bitfordge project hub"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#98989d]">
                <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> {ghData.stargazers_count || 0}</span>
                <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> {ghData.open_issues_count || 0}</span>
                <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> {ghData.forks_count || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Project Cards */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {projects.map((p) => (
            <div key={p.slug} className="glass rounded-xl p-5 transition hover:border-[rgba(255,255,255,0.15)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <h2 className="font-semibold">{p.name}</h2>
                  </div>
                  <p className="text-xs text-[#636366] mt-0.5">{p.type}</p>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (p.status === "live" ? "bg-[rgba(48,209,88,0.15)] text-[#30d158]" : "bg-[rgba(99,99,102,0.15)] text-[#636366]")}>{p.status}</span>
              </div>
              <p className="text-sm text-[#98989d] mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-[#636366]">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {p.url ? (
                  <a href={p.url} target="_blank" className="flex items-center gap-1 rounded-lg bg-[#0071E3] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0082ff]">
                    Open <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                  </a>
                ) : (
                  <span className="text-xs text-[#636366]">Not deployed</span>
                )}
                <a href={"https://github.com/Grantgazvoda-alt/bitfordge"} target="_blank" className="flex items-center gap-1 text-xs text-[#636366] transition hover:text-[#f5f5f7]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" /></svg>
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* GitHub Activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Commits */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Recent Commits</h2>
            {ghCommits.length === 0 ? (
              <p className="text-xs text-[#636366]">Loading...</p>
            ) : (
              <div className="space-y-3">
                {ghCommits.map((c: any) => (
                  <div key={c.sha} className="flex items-start gap-3">
                    <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-[rgba(0,113,227,0.1)]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#98989d] truncate">{c.commit.message.split('\n')[0]}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#636366]">{c.commit.author?.name}</span>
                        <span className="text-[10px] text-[#636366]">{new Date(c.commit.author?.date).toLocaleDateString()}</span>
                        <code className="text-[9px] text-[#636366] font-mono">{c.sha.slice(0, 7)}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="https://github.com/Grantgazvoda-alt/bitfordge" target="_blank" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition hover:bg-[rgba(255,255,255,0.02)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z"/></svg>
                <span className="text-sm">GitHub Repository</span>
                <span className="ml-auto text-xs text-[#636366]">bitfordge →</span>
              </a>
              <Link to="/admin" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition hover:bg-[rgba(255,255,255,0.02)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                <span className="text-sm">Manage API Keys</span>
                <span className="ml-auto text-xs text-[#636366]">Scoped access →</span>
              </Link>
              <Link to="/docs" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition hover:bg-[rgba(255,255,255,0.02)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                <span className="text-sm">API Documentation</span>
                <span className="ml-auto text-xs text-[#636366]">OpenAPI →</span>
              </Link>
              <a href="https://gummy-bear-command.higgsfield.app" target="_blank" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition hover:bg-[rgba(255,255,255,0.02)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-sm">Gummy Bear Command</span>
                <span className="ml-auto text-xs text-[#636366]">Open →</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}