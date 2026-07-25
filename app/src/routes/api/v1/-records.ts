import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lineageEntrySchema = z.object({
  agent_id: z.string().min(1),
  file_path: z.string().optional().default(""),
  file_language: z.string().optional().default(""),
  reasoning: z.string().optional().default(""),
  model_used: z.string().optional().default(""),
  prompt_snapshot: z.string().optional().default(""),
  content_hash: z.string().optional().default(""),
  duration_ms: z.number().int().optional().default(0),
  retry_count: z.number().int().optional().default(0),
  error_message: z.string().optional().default(""),
});

const recordSchema = z.object({
  source_project: z.enum(["stackforge", "gummy-bear"]),
  source_project_id: z.string().min(1),
  user_id: z.string().min(1),
  brief: z.string().min(1),
  architecture_plan: z.string().optional(),
  tech_stack: z.string().optional(),
  version_number: z.number().int().optional(),
  file_count: z.number().int().optional(),
  total_lines: z.number().int().optional(),
  commit_hash: z.string().optional(),
  commit_message: z.string().optional(),
  repo_url: z.string().optional(),
  repo_name: z.string().optional(),
  pipeline_duration_ms: z.number().int().optional(),
  model_used: z.string().optional(),
  fix_rounds: z.number().int().optional(),
  build_status: z.enum(["pending", "passed", "failed", "not_run"]).optional(),
  test_status: z.enum(["pending", "passed", "failed", "not_run"]).optional(),
  lineage: z.array(lineageEntrySchema).optional().default([]),
});

export const createRecord = createServerFn({ method: "POST" })
  .validator(recordSchema)
  .handler(async ({ data }) => {
    const { bindings } = await import("../../../lib/bindings.server");
    const env = bindings();
    if (!env.DB) throw new Error("Database not available");
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO provenance_records (id, source_project, source_project_id, user_id, brief, architecture_plan, tech_stack, version_number, file_count, total_lines, commit_hash, commit_message, repo_url, repo_name, pipeline_duration_ms, model_used, fix_rounds, build_status, test_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, data.source_project, data.source_project_id, data.user_id, data.brief,
      data.architecture_plan ?? "", data.tech_stack ?? "", data.version_number ?? 0,
      data.file_count ?? 0, data.total_lines ?? 0, data.commit_hash ?? "",
      data.commit_message ?? "", data.repo_url ?? "", data.repo_name ?? "",
      data.pipeline_duration_ms ?? 0, data.model_used ?? "", data.fix_rounds ?? 0,
      data.build_status ?? "not_run", data.test_status ?? "not_run"
    ).run();
    for (const entry of data.lineage) {
      const lineageId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO provenance_lineage (id, provenance_id, agent_id, file_path, file_language, reasoning, model_used, prompt_snapshot, content_hash, duration_ms, retry_count, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        lineageId, id, entry.agent_id, entry.file_path, entry.file_language,
        entry.reasoning, entry.model_used, entry.prompt_snapshot, entry.content_hash,
        entry.duration_ms, entry.retry_count, entry.error_message
      ).run();
    }
    return { id, status: "created" };
  });