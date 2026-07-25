import { createAPIFileRoute } from "@tanstack/react-start/api";
import { z } from "zod";

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
  lineage: z.array(z.object({
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
  })).optional().default([]),
});

export const APIRoute = createAPIFileRoute("/api/v1/records")({
  POST: async ({ request }) => {
    const body = await request.json();
    const parsed = recordSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
    }
    const { bindings } = await import("../../../../lib/bindings.server");
    const env = bindings();
    if (!env.DB) {
      return Response.json({ error: "database_unavailable" }, { status: 503 });
    }
    const id = crypto.randomUUID();
    const data = parsed.data;
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

    return Response.json({ id, status: "created" }, { status: 201 });
  },

  GET: async ({ request }) => {
    const { bindings } = await import("../../../../lib/bindings.server");
    const env = bindings();
    if (!env.DB) return Response.json({ error: "database_unavailable" }, { status: 503 });
    const url = new URL(request.url);
    const source = url.searchParams.get("source");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    let query = "SELECT * FROM provenance_records";
    const params: string[] = [];
    if (source) { query += " WHERE source_project = ?"; params.push(source); }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(String(limit), String(offset));

    const result = await env.DB.prepare(query).bind(...params).all();
    const countResult = await (source
      ? env.DB.prepare("SELECT COUNT(*) as total FROM provenance_records WHERE source_project = ?").bind(source)
      : env.DB.prepare("SELECT COUNT(*) as total FROM provenance_records")
    ).first<{ total: number }>();

    return Response.json({ data: result.results, total: countResult?.total ?? 0, limit, offset });
  },
});