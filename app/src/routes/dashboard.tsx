import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsFn } from "../lib/provenance.functions";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: analytics } = useQuery({
    queryKey: ["provenance", "analytics"],
    queryFn: () => getAnalyticsFn(),
  });

  const a = (analytics as any) ?? {};

  const projects = [
    {
      name: "Gummy Bear Command",
      url: "https://gummy-bear-command.higgsfield.app",
      slug: "gummy-bear-command",
      type: "Higgsfield-integrated app",
      status: "live",
      github: "https://github.com/Grantgazvoda-alt/bitfordge",
      description: "Brand content studio with the Constellation Engine — a 7-agent AI code generation system, content planning, calendar scheduling, and analytics.",
      features: ["7 AI agents", "Build container", "Deploy to Vercel/Netlify/Render", "GitHub integration", "Content studio"],
    },
    {
      name: "StackForge",
      url: "https://stackforge-builder.higgsfield.app",
      slug: "stackforge-builder",
      type: "Standalone website",
      status: "live",
      github: null,
      description: "Standalone AI-powered full-stack code generator. Natural language to full-stack code with GitHub push and one-click deploy.",
      features: ["Multi-step AI pipeline", "JWT auth", "GitHub integration", "Deploy APIs", "Glassmorphism UI"],
    },
    {
      name: "Your Potential",
      url: "https://your-potential.higgsfield.app",
      slug: "your-potential",
      type: "Standalone website",
      status: "live",
      github: null,
      description: "AI-powered business launch platform with BRAINS engine, launch kits, advisory, health score, and opportunity feed.",
      features: ["BRAINS engine", "Launch Kits", "AI Phone Coach", "CRM", "Pulse analytics"],
    },
    {
      name: "Orgasmo",
      url: "https://orgasmo.higgsfield.app",
      slug: "orgasmo",
      type: "Higgsfield-integrated app",
      status: "live",
      github: null,
      description: "Image generation platform using GPT Image 2 with bulk variation generation and template presets.",
      features: ["GPT Image 2", "Bulk generation", "Template presets", "Feed/history", "Projects"],
    },
    {
      name: "Omni Reason",
      url: null,
      slug: "omni-reason",
      type: "Higgsfield-integrated app",
      status: "not deployed",
      github: null,
      description: "Multi-reasoning AI platform.",
      features: ["Not yet deployed"],
    },
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Project Hub</h1>
        <p className="mt-1 text-[#98989d]">All your AI-generated software projects in one place</p>

        {/* Overview */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-xl p-5">
            <div className="text-[#98989d] text-sm">Projects</div>
            <div className="mt-2 text-3xl font-bold">{projects.filter(p => p.status === "live").length}</div>
            <p className="mt-1 text-xs text-[#636366]">live</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="text-[#98989d] text-sm">GitHub Repos</div>
            <div className="mt-2 text-3xl font-bold">{projects.filter(p => p.github).length}</div>
            <p className="mt-1 text-xs text-[#636366]">bitfordge on GitHub</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="text-[#98989d] text-sm">API Keys</div>
            <div className="mt-2 text-3xl font-bold">{a.certificates ?? 0}</div>
            <p className="mt-1 text-xs text-[#636366]">scoped keys managed</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="text-[#98989d] text-sm">Data</div>
            <div className="mt-2 text-3xl font-bold">{a.total ?? 0}</div>
            <p className="mt-1 text-xs text-[#636366]">provenance records</p>
          </div>
        </div>

        {/* Project Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.slug} className="glass rounded-xl p-6 transition hover:border-[rgba(0,113,227,0.3)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-xs text-[#636366] mt-0.5">{project.type}</p>
                </div>
                <span className={"flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium " + (project.status === "live" ? "bg-[rgba(48,209,88,0.15)] text-[#30d158]" : "bg-[rgba(99,99,102,0.15)] text-[#636366]")}>
                  <span className={"size-1.5 rounded-full " + (project.status === "live" ? "bg-[#30d158]" : "bg-[#636366]")} />
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-[#98989d] mb-4">{project.description}</p>

              {project.features && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.features.map((f) => (
                    <span key={f} className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-[#636366]">{f}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-[#0071E3] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#0082ff]">
                    Open App
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                  </a>
                ) : (
                  <span className="text-xs text-[#636366]">Not deployed</span>
                )}
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#98989d] transition hover:text-[#f5f5f7]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" /></svg>
                    GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="/admin" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-4 transition hover:bg-[rgba(255,255,255,0.02)]">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(0,113,227,0.1)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium">Manage API Keys</p>
                <p className="text-xs text-[#98989d]">Create and scope keys for CI/CD</p>
              </div>
            </a>
            <a href="/docs" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-4 transition hover:bg-[rgba(255,255,255,0.02)]">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(48,209,88,0.1)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium">API Documentation</p>
                <p className="text-xs text-[#98989d]">OpenAPI spec and endpoint reference</p>
              </div>
            </a>
            <a href="https://github.com/Grantgazvoda-alt/bitfordge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] p-4 transition hover:bg-[rgba(255,255,255,0.02)]">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[rgba(255,214,10,0.1)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffd60a"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium">GitHub Repository</p>
                <p className="text-xs text-[#98989d]">Source code on GitHub</p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}