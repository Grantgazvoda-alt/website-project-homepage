// Audit log CSV export — downloads all audit logs as a CSV file
import { createServerFn } from "@tanstack/react-start";

export const exportAuditCsv = createServerFn({ method: "GET" }).handler(async () => {
  const { bindings } = await import("../../../lib/bindings.server");
  const env = bindings();
  if (!env.DB) throw new Error("Database not available");

  const result = await env.DB.prepare("SELECT * FROM provenance_audit_log ORDER BY created_at DESC").all();
  const logs = result.results ?? [];

  const headers = ["id", "actor_id", "action", "target_type", "target_id", "old_value", "new_value", "metadata", "created_at"];
  const csvRows = [headers.join(",")];

  for (const log of logs as any[]) {
    const row = headers.map(h => {
      const val = String(log[h] ?? "");
      // Escape CSV: wrap in quotes if contains comma, quote, or newline
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
