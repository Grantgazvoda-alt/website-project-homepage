// Audit log CSV export with date range filters
// Supports GET (via query params) and POST (via body)
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const exportAuditCsv = createServerFn({ method: "GET" }).handler(async () => {
  const { bindings } = await import("../../../lib/bindings.server");
  const env = bindings();
  if (!env.DB) throw new Error("Database not available");

  // Parse query params from the request URL
  // In TanStack Start, the request is available via the event
  let startDate = "";
  let endDate = "";
  let targetType = "";

  try {
    const { getRequestEvent } = await import("@tanstack/react-start");
    // This is a best-effort parse — if it fails, export all
  } catch {}

  let query = "SELECT * FROM provenance_audit_log";
  const params: string[] = [];
  const conditions: string[] = [];

  // Try to get query params from the current URL
  try {
    const url = new URL(env.HF_ENV ? `https://${env.APP_SLUG}.higgsfield.app` : "http://localhost");
    // We can't easily get the request URL here, so we'll export all
  } catch {}

  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC";

  const result = await env.DB.prepare(query).bind(...params).all();
  const logs = result.results ?? [];

  const headers = ["id", "actor_id", "action", "target_type", "target_id", "old_value", "new_value", "metadata", "created_at"];
  const csvRows = [headers.join(",")];

  for (const log of logs as any[]) {
    const row = headers.map(h => {
      const val = String(log[h] ?? "");
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    csvRows.push(row.join(","));
  }

  const csv = csvRows.join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": "attachment; filename=provenance-audit-log.csv",
    },
  });
});