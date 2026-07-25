import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[30%] h-[600px] w-[600px] rounded-full bg-[#0071E3] opacity-[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-[#0071E3] opacity-[0.05] blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Provenance</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/api/v1/records" className="text-sm font-medium text-[#98989d] transition hover:text-[#f5f5f7]">API</a>
          <a href="/dashboard" className="rounded-lg bg-[#0071E3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0082ff]">Dashboard</a>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center px-6 pt-20 pb-24 text-center md:pt-32 md:pb-40">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(18,18,26,0.6)] px-4 py-1.5 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-[#30d158] animate-pulse" />
          <span className="text-xs font-medium text-[#98989d]">Code provenance tracking</span>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Know where your code<br />
          <span className="gradient-accent">came from. Always.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-[#98989d] md:text-xl">
          Provenance Intelligence System tracks every generated file back to its origin — the brief, the agent decisions, the prompts, and the deployment. Full audit trail, one-click rollback, and verifiable origin certificates.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <a href="/dashboard" className="group flex items-center gap-2 rounded-xl bg-[#0071E3] px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(0,113,227,0.4)] transition hover:bg-[#0082ff] hover:shadow-[0_0_40px_rgba(0,113,227,0.6)]">
            Open Dashboard
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Full lifecycle tracking</h2>
          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { num: "01", title: "Record Generation", desc: "Every code generation run is recorded: brief, architecture plan, agent decisions, file hashes, and model used." },
              { num: "02", title: "Track Lineage", desc: "Trace any file back to the exact agent, prompt, and reasoning that produced it. SHA-256 content hashes ensure integrity." },
              { num: "03", title: "Monitor Deployments", desc: "Track deployments across preview, staging, and production. Poll Vercel, Netlify, and Render for live status." },
              { num: "04", title: "One-Click Rollback", desc: "Revert to any previous deployment. Impact analysis shows what changes will be reverted before you confirm." },
              { num: "05", title: "Origin Certificates", desc: "Cryptographically signed certificates linking brief → agent decisions → generated code → deployment. Tamper-evident." },
              { num: "06", title: "Cross-Project Analytics", desc: "Aggregate build success rates, model usage, and error patterns across StackForge and Gummy Bear projects." },
            ].map((f) => (
              <div key={f.num} className="glass rounded-xl p-6 transition hover:border-[rgba(0,113,227,0.3)]">
                <div className="mb-3 font-mono text-sm font-bold text-[#0071E3]">{f.num}</div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[#98989d]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="glass-strong rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">API-first design</h2>
            <p className="mt-4 text-lg text-[#98989d]">REST + GraphQL endpoints for programmatic integration. Use the &lt;script&gt; tag to submit provenance records from any code generator.</p>
            <div className="mt-8 rounded-xl bg-[rgba(10,10,15,0.6)] border border-[rgba(255,255,255,0.1)] p-6 text-left">
              <pre className="text-sm font-mono text-[#f5f5f7]">
                <code>{`POST /api/v1/records
{
  "source_project": "gummy-bear",
  "source_project_id": "uuid",
  "user_id": "uuid",
  "brief": "Build a task management app...",
  "lineage": [
    {
      "agent_id": "architect",
      "reasoning": "Chose React...",
      "model_used": "gpt-4o"
    }
  ]
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)] px-6 py-12 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
            </div>
            <span className="font-semibold">Provenance Intelligence System</span>
          </div>
          <p className="text-sm text-[#636366]">Code lineage tracking, deployment provenance, and origin certificates.</p>
        </div>
      </footer>
    </div>
  );
}