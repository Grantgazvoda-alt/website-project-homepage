import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: CodePage,
});

const AGENTS = [
  { id: "architect", name: "Architect", color: "#A78BFA", desc: "Analyzes your brief and produces the full-stack architecture plan" },
  { id: "frontend", name: "Front-End", color: "#60A5FA", desc: "Generates React/TypeScript components, pages, and styling" },
  { id: "backend", name: "Back-End", color: "#34D399", desc: "Generates Node.js/Express or Python/FastAPI server code" },
  { id: "database", name: "Database", color: "#FBBF24", desc: "Generates SQL migrations, indexes, and seed data" },
  { id: "api", name: "API", color: "#F472B6", desc: "Generates REST/GraphQL routes with JWT auth and validation" },
  { id: "devops", name: "DevOps", color: "#22D3EE", desc: "Generates Dockerfile, CI/CD, and deployment config" },
  { id: "reviewer", name: "Reviewer", color: "#D9FF2E", desc: "Reviews all code, identifies issues, and finalizes" },
];

function CodePage() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(-1);
  const [results, setResults] = useState<any[]>([]);
  const [files, setFiles] = useState<Record<string, { content: string; language: string }>>({});
  const [selectedFile, setSelectedFile] = useState("");
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim() || !apiKey.trim()) return;
    setGenerating(true);
    setError("");
    setResults([]);
    setFiles({});
    setSelectedFile("");
    setCurrentAgent(0);
    setProjectId("");

    try {
      const { runPipelineFn } = await import("../lib/engine.server");
      const result = await runPipelineFn({ data: { apiKey, brief: prompt } });
      setProjectId(result.projectId);
      setResults(result.results);
      const allFiles: Record<string, { content: string; language: string }> = {};
      for (const r of result.results) {
        if (r.files) Object.assign(allFiles, r.files);
      }
      setFiles(allFiles);
      const entries = Object.keys(allFiles);
      if (entries.length > 0) setSelectedFile(entries[0]);
      setCurrentAgent(-1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const fileEntries = Object.entries(files).sort(([a], [b]) => a.localeCompare(b));
  const selectedContent = selectedFile ? files[selectedFile]?.content || "" : "";

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7] flex flex-col h-dvh">
      <header className="shrink-0 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl px-6 py-2.5">
        <div className="mx-auto max-w-7xl flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
          </div>
          <span className="font-semibold">Bitfordge Code</span>
          <span className="text-xs text-[#636366] ml-auto">v0.1 — 7-agent full-stack generator</span>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex mx-auto w-full max-w-7xl px-6 py-4 gap-4">
        {/* Left Panel */}
        <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto">
          <div>
            <label className="text-xs font-medium text-[#636366] mb-1 block">OpenAI API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-3 py-2 text-sm text-[#f5f5f7] outline-none transition focus:border-[#0071E3] font-mono text-xs"
              placeholder="sk-..." />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-xs font-medium text-[#636366] mb-1 block">Project Brief</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={8}
              className="flex-1 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-4 py-3 text-sm text-[#f5f5f7] outline-none transition focus:border-[#0071E3] resize-none"
              placeholder="Build a SaaS task manager with teams, real-time sync, Stripe billing, and a dashboard with analytics charts..." />
          </div>
          <button onClick={handleGenerate} disabled={generating || !prompt.trim() || !apiKey.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0082ff] disabled:opacity-50 shadow-[0_0_20px_rgba(0,113,227,0.3)]">
            {generating ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> Generate Full Stack</>
            )}
          </button>
          {error && <p className="text-sm text-[#ff453a]">{error}</p>}

          {/* Agent Progress */}
          <div className="space-y-1.5">
            {AGENTS.map((a, i) => {
              const status = generating && i === currentAgent ? "running" : generating && i < currentAgent ? "done" : results.length > 0 && results[i] ? "done" : "pending";
              return (
                <div key={a.id} className={"flex items-center gap-2 rounded-lg px-3 py-2 transition " + (status === "running" ? "bg-[rgba(0,113,227,0.1)] border border-[rgba(0,113,227,0.2)]" : "bg-transparent")}>
                  <div className={"size-2 rounded-full shrink-0 " + (status === "done" ? "bg-[#30d158]" : status === "running" ? "bg-[#0071E3] animate-pulse" : "bg-[#636366]")} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: status === "done" ? "#30d158" : status === "running" ? "#f5f5f7" : "#636366" }}>{a.name}</div>
                    <div className="text-[10px] text-[#636366] truncate">{a.desc}</div>
                  </div>
                  {status === "done" && results[i]?.reasoning && (
                    <div className="ml-auto text-[10px] text-[#636366] shrink-0" title={results[i].reasoning.slice(0, 200)}>OK</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* File Tree */}
          {fileEntries.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
              {fileEntries.map(([path]) => (
                <button key={path} onClick={() => setSelectedFile(path)}
                  className={"shrink-0 rounded px-2.5 py-1 text-[11px] font-mono transition " + (selectedFile === path ? "bg-[#0071E3] text-white" : "bg-[rgba(255,255,255,0.05)] text-[#636366] hover:text-[#f5f5f7]")}>
                  {path.split("/").pop()}
                </button>
              ))}
            </div>
          )}

          {/* Code View */}
          <div className="flex-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.4)] overflow-hidden flex flex-col">
            {selectedFile && (
              <div className="shrink-0 border-b border-[rgba(255,255,255,0.06)] px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-mono text-[#636366]">{selectedFile}</span>
                <span className="text-[10px] text-[#636366]">{files[selectedFile]?.language || ""}</span>
              </div>
            )}
            <div className="flex-1 overflow-auto p-4">
              {selectedContent ? (
                <pre className="text-xs font-mono text-[#f5f5f7] whitespace-pre-wrap leading-relaxed">{selectedContent}</pre>
              ) : generating ? (
                <div className="flex items-center justify-center h-full text-sm text-[#636366]">
                  <div className="text-center">
                    <div className="h-8 w-8 mx-auto mb-3 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
                    <p>Running {AGENTS[currentAgent]?.name || "agents"}...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-[#636366]">
                  <div className="text-center max-w-md">
                    <p className="mb-2">Enter your OpenAI API key and describe what you want to build.</p>
                    <p className="text-xs">7 agents will generate the complete full-stack code.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {fileEntries.length > 0 && (
            <div className="shrink-0 mt-2 flex items-center gap-3 text-[10px] text-[#636366]">
              <span>{fileEntries.length} files</span>
              <span>{Object.values(files).reduce((s, f) => s + f.content.split("\n").length, 0).toLocaleString()} lines</span>
              {projectId && <span className="ml-auto">Project: {projectId.slice(0, 8)}</span>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
