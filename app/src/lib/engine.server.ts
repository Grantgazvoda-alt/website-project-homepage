import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bindings } from "./bindings.server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const AGENT_PROMPTS: Record<string, string> = {
  architect: "You are a senior full-stack architect. Analyze the user's request and produce a detailed architecture plan. Return JSON: { \"techStack\": \"...\", \"plan\": \"...\", \"folderStructure\": \"...\" }",
  frontend: "You are a senior frontend developer. Generate complete React/TypeScript code based on the architecture plan. Return JSON: { \"files\": { \"filepath\": { \"content\": \"...\", \"language\": \"...\" } } }",
  backend: "You are a senior backend developer. Generate complete server code based on the architecture plan. Return JSON: { \"files\": { \"filepath\": { \"content\": \"...\", \"language\": \"...\" } } }",
  database: "You are a senior database architect. Generate SQL migrations and schema. Return JSON: { \"files\": { \"filepath\": { \"content\": \"...\", \"language\": \"sql\" } } }",
  api: "You are a senior API developer. Generate REST/GraphQL endpoints. Return JSON: { \"files\": { \"filepath\": { \"content\": \"...\", \"language\": \"...\" } } }",
  devops: "You are a senior DevOps engineer. Generate Dockerfile, CI/CD, and config. Return JSON: { \"files\": { \"filepath\": { \"content\": \"...\", \"language\": \"...\" } } }",
  reviewer: "You are a senior code reviewer. Review all generated code and produce a final summary. Return JSON: { \"summary\": \"...\", \"issues\": [], \"fixes\": {} }",
};

export const AGENT_ORDER = ["architect", "frontend", "backend", "database", "api", "devops", "reviewer"];
export const AGENT_NAMES: Record<string, string> = { architect: "Architect", frontend: "Front-End", backend: "Back-End", database: "Database", api: "API", devops: "DevOps", reviewer: "Reviewer" };

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const resp = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], max_tokens: 16384, response_format: { type: "json_object" } }),
  });
  if (!resp.ok) throw new Error("OpenAI API error: " + (await resp.text()));
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

export const runPipelineFn = createServerFn({ method: "POST" })
  .validator(z.object({ apiKey: z.string(), brief: z.string() }))
  .handler(async ({ data }) => {
    const { DB, STORAGE } = bindings();
    const projectId = crypto.randomUUID();
    let context = "";
    const results: any[] = [];
    let allFiles: Record<string, { content: string; language: string }> = {};

    if (DB) {
      await DB.prepare("INSERT INTO provenance_records (id, source_project, source_project_id, user_id, brief, created_at) VALUES (?, 'bitfordge', ?, ?, ?, datetime('now'))")
        .bind(projectId, projectId, "anonymous", data.brief).run();
    }

    for (const agentId of AGENT_ORDER) {
      const systemPrompt = AGENT_PROMPTS[agentId];
      const userPrompt = agentId === "architect"
        ? data.brief
        : "Architecture plan:\n" + (context.slice(0, 5000)) + "\n\nGenerate the " + agentId + " code. Return JSON with files.";
      const response = await callOpenAI(data.apiKey, systemPrompt, userPrompt);
      let parsed: any;
      try { parsed = JSON.parse(response); } catch { parsed = { output: response }; }

      const agentResult = { agentId, reasoning: parsed.plan || parsed.summary || "", files: parsed.files || {}, outputSummary: parsed.summary || parsed.plan || "" };
      results.push(agentResult);

      if (parsed.plan) context += "[Architect]\n" + parsed.plan + "\n";
      if (parsed.techStack) context += "[Stack] " + parsed.techStack + "\n";
      if (parsed.files) {
        for (const path of Object.keys(parsed.files)) {
          context += "[File] " + path + "\n";
          allFiles[path] = parsed.files[path];
        }
      }
    }

    if (STORAGE) {
      await STORAGE.put("projects/" + projectId + "/v1.json", JSON.stringify(allFiles));
    }

    const fileCount = Object.keys(allFiles).length;
    const totalLines = Object.values(allFiles).reduce((s, f) => s + f.content.split("\n").length, 0);

    if (DB) {
      await DB.prepare("UPDATE provenance_records SET file_count = ?, total_lines = ? WHERE id = ?").bind(fileCount, totalLines, projectId).run();
    }

    return { projectId, results, fileCount, totalLines };
  });