import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
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
            <a href="/api/v1/records" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">API</a>
            <a href="/docs" className="text-sm text-[#98989d] transition hover:text-[#f5f5f7]">Docs</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[#98989d]">Provenance Intelligence System — code lineage and deployment tracking</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Total Records</div>
            <div className="mt-2 text-3xl font-bold">0</div>
            <p className="mt-1 text-xs text-[#636366]">No data yet — integrate with StackForge or Gummy Bear</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Deployments</div>
            <div className="mt-2 text-3xl font-bold">0</div>
            <p className="mt-1 text-xs text-[#636366]">No deployments tracked</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Build Success Rate</div>
            <div className="mt-2 text-3xl font-bold">—</div>
            <p className="mt-1 text-xs text-[#636366]">No builds recorded</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#98989d] text-sm">Certificates</div>
            <div className="mt-2 text-3xl font-bold">0</div>
            <p className="mt-1 text-xs text-[#636366]">No origin certificates generated</p>
          </div>
        </div>

        <div className="mt-8 glass rounded-xl p-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,113,227,0.1)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold">No provenance records yet</h2>
          <p className="mt-2 text-[#98989d] max-w-lg mx-auto">
            This dashboard shows code generation lineage, deployment tracking, and origin certificates. Connect StackForge or Gummy Bear to start recording provenance.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/api/v1/records" className="rounded-lg bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0082ff]">View API</a>
            <a href="/docs" className="rounded-lg border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-medium text-[#98989d] transition hover:bg-[rgba(255,255,255,0.05)]">Documentation</a>
          </div>
        </div>
      </main>
    </div>
  );
}