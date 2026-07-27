import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[30%] h-[600px] w-[600px] rounded-full bg-[#0071E3] opacity-[0.07] blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Bitfordge</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="rounded-lg bg-[#0071E3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0082ff]">Open Project Hub</Link>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center px-6 pt-20 pb-24 text-center md:pt-32 md:pb-40">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(18,18,26,0.6)] px-4 py-1.5 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-[#30d158] animate-pulse" />
          <span className="text-xs font-medium text-[#98989d]">3 projects live</span>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Your AI projects.<br />
          <span className="gradient-accent">One dashboard.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-[#98989d] md:text-xl">
          Bitfordge is the project hub for all your AI-generated software. See every project, check deploy status, push to GitHub, and manage everything from one place.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link to="/dashboard" className="group flex items-center gap-2 rounded-xl bg-[#0071E3] px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(0,113,227,0.4)] transition hover:bg-[#0082ff]">
            Open Project Hub
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Your projects at a glance</h2>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            <div className="glass rounded-xl p-6 transition hover:border-[rgba(0,113,227,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="size-2 rounded-full bg-[#30d158]" />
                <span className="text-xs font-medium text-[#30d158]">LIVE</span>
              </div>
              <h3 className="text-lg font-semibold">Gummy Bear Command</h3>
              <p className="mt-2 text-sm text-[#98989d]">Brand content studio + Constellation Engine code generator</p>
              <a href="https://gummy-bear-command.higgsfield.app" target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs text-[#0071E3]">gummy-bear-command.higgsfield.app ↗</a>
            </div>
            <div className="glass rounded-xl p-6 transition hover:border-[rgba(0,113,227,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="size-2 rounded-full bg-[#30d158]" />
                <span className="text-xs font-medium text-[#30d158]">LIVE</span>
              </div>
              <h3 className="text-lg font-semibold">StackForge</h3>
              <p className="mt-2 text-sm text-[#98989d]">Standalone AI full-stack code generator</p>
              <a href="https://stackforge-builder.higgsfield.app" target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs text-[#0071E3]">stackforge-builder.higgsfield.app ↗</a>
            </div>
            <div className="glass rounded-xl p-6 transition hover:border-[rgba(0,113,227,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="size-2 rounded-full bg-[#30d158]" />
                <span className="text-xs font-medium text-[#30d158]">LIVE</span>
              </div>
              <h3 className="text-lg font-semibold">Your Potential</h3>
              <p className="mt-2 text-sm text-[#98989d]">AI-powered business launch platform</p>
              <a href="https://your-potential.higgsfield.app" target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs text-[#0071E3]">your-potential.higgsfield.app ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">What you can do here</h2>
          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "See all projects", desc: "Every project in one dashboard with live status, URLs, and GitHub links." },
              { title: "Track deployments", desc: "See which version is deployed where, and roll back if needed." },
              { title: "Manage API keys", desc: "Create scoped keys for CI/CD pipelines with read/write/admin permissions." },
              { title: "Monitor builds", desc: "Build success rates, model usage, and deployment history at a glance." },
            ].map((f) => (
              <div key={f.title} className="glass rounded-xl p-6">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[#98989d]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)] px-6 py-12 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
            </div>
            <span className="font-semibold">Bitfordge</span>
          </div>
          <p className="text-sm text-[#636366]">Project hub for AI-generated software.</p>
        </div>
      </footer>
    </div>
  );
}