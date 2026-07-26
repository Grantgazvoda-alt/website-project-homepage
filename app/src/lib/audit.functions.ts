import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { listAuditLogs, logAuditEvent } from "./provenance-auth.server";

export const listAuditLogsFn = createServerFn({ method: "POST" })
  .validator(z.object({ targetType: z.string().optional(), targetId: z.string().optional(), limit: z.number().int().optional().default(50), offset: z.number().int().optional().default(0) }))
  .handler(async ({ data }) => listAuditLogs(data.targetType, data.targetId, data.limit, data.offset) as any);

export const logAuditEventFn = createServerFn({ method: "POST" })
  .validator(z.object({ actorId: z.string(), action: z.string(), targetType: z.string(), targetId: z.string(), oldValue: z.string().optional(), newValue: z.string().optional(), metadata: z.string().optional() }))
  .handler(async ({ data }) => logAuditEvent(data.actorId, data.action, data.targetType, data.targetId, data.oldValue, data.newValue, data.metadata) as any);