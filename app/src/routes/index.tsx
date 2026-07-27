import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: CodePage,
});

function CodePage() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [agent, setAgent] = useState(0);

  const agents = ["Architect", "Front-End", "Back-End", "Database", "API", "DevOps", "Reviewer"];

  const handleGenerate = async () => {
    if (!prompt.trim() || !apiKey.trim()) return;
    setGenerating(true);
    setError("");
    setResult("");
    setAgent(0);

    const steps = [
      "You are a senior full-stack architect. Analyze the user's request and produce a detailed architecture plan with tech stack choices, database schema, API endpoints, and folder structure.",
      "You are a senior frontend developer. Generate complete React/TypeScript code based on the architecture plan. Include all components, hooks, and styles.",
      "You are a senior backend developer. Generate complete Node.js/Express or Python/FastAPI server code with routes, middleware, error handling, and CORS.",
      "You are a senior database architect. Generate SQL migration files with CREATE TABLE statements, indexes, foreign keys, and seed data.",
      "You are a senior API developer. Generate REST/GraphQL route handlers with JWT auth, input validation, and error responses.",
      "You are a senior DevOps engineer. Generate Dockerfile, docker-compose.yml, .env.example, and CI/CD config.",
      "You are a senior code reviewer. Review all generated code, identify integration issues, and produce a final summary.",
    ];

    let fullCode = "";
    for (let i = 0; i < steps.length; i++) {
      setAgent(i);
      try {
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: steps[i] },
              { role: "user", content: i === 0 ? prompt : "Using the architecture plan above, generate the code for the next component." },
            ],
            max_tokens: 4096,
          }),
        });
        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content || "";
        fullCode += "=== " + agents[i] + " ===\n\n" + text + "\n\n";
        setResult(fullCode);
      } catch (e) {
        setError("Agent " + agents[i] + " failed: " + (e instanceof Error ? e.message : "Unknown error"));
        break;
      }
    }
    setGenerating(false);
    setAgent(0);
  };

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f5f5f7] flex flex-col">
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071E3] to-[#0082ff]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
          </div>
          <span className="font-semibold">Bitfordge Code</span>
          <span className="text-xs text-[#636366] ml-auto">7-agent AI code generator</span>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8 flex gap-6">
        <div className="w-96 shrink-0 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[#98989d] mb-1.5 block">OpenAI API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-4 py-2.5 text-sm text-[#f5f5f7] outline-none transition focus:border-[#0071E3]"
              placeholder="sk-..." />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-[#98989d] mb-1.5 block">Describe your project</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={12}
              className="flex-1 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,15,0.6)] px-5 py-4 text-sm text-[#f5f5f7] outline-none transition focus:border-[#0071E3] resize-none"
              placeholder="Build a SaaS task manager with teams, real-time sync, Stripe billing, and a dashboard with analytics charts..." />
          </div>
          <button onClick={handleGenerate} disabled={generating || !prompt.trim() || !apiKey.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,113,227,0.3)] transition hover:bg-[#0082ff] disabled:opacity-50">
            {generating ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Running agents...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> Generate Full Stack</>
            )}
          </button>
          {error && <p className="text-sm text-[#ff453a]">{error}</p>}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-medium text-[#98989d]">AGENTS</span>
            {agents.map((name, i) => (
              <div key={name} className={"px-2 py-1 rounded text-[10px] font-medium transition " + (
                generating && i === agent ? "bg-[#0071E3] text-white animate-pulse"
                : generating && i < agent ? "bg-[rgba(48,209,88,0.15)] text-[#30d158]"
                : "bg-[rgba(255,255,255,0.05)] text-[#636366]"
              )}>{name}</div>
            ))}
          </div>
          <div className="flex-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.4)] overflow-auto p-4">
            {result ? (
              <pre className="text-xs font-mono text-[#f5f5f7] whitespace-pre-wrap">{result}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[#636366]">
                {generating ? "Waiting for agents..." : "Enter your OpenAI key and a prompt, then click Generate"}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
