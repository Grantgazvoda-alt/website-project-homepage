import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as provenance from "./provenance.server";

export const createRecordFn = createServerFn({ method: "POST" })
  .validator(provenance.recordSchema)
  .handler(({ data }) => provenance.createRecord(data) as any);

export const listRecordsFn = createServerFn({ method: "POST" })
  .validator(z.object({ source: z.string().optional(), limit: z.number().int().min(1).max(100).optional().default(50), offset: z.number().int().min(0).optional().default(0) }))
  .handler(({ data }) => provenance.listRecords(data.source, data.limit, data.offset) as any);

export const getRecordFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) => provenance.getRecord(data.id) as any);

export const deleteRecordFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) => provenance.deleteRecord(data.id) as any);

export const traceLineageFn = createServerFn({ method: "POST" })
  .validator(z.object({ contentHash: z.string() }))
  .handler(({ data }) => provenance.traceLineage(data.contentHash) as any);

export const traceByFileFn = createServerFn({ method: "POST" })
  .validator(z.object({ filePath: z.string(), repoName: z.string().optional() }))
  .handler(({ data }) => provenance.traceByFile(data.filePath, data.repoName) as any);

export const createDeploymentFn = createServerFn({ method: "POST" })
  .validator(z.object({ provenance_id: z.string(), environment: z.string(), provider: z.string(), live_url: z.string().optional(), branch: z.string().optional(), deployed_by: z.string().optional() }))
  .handler(({ data }) => provenance.createDeployment(data) as any);

export const listDeploymentsFn = createServerFn({ method: "POST" })
  .validator(z.object({ environment: z.string().optional(), provider: z.string().optional(), limit: z.number().int().optional().default(50), offset: z.number().int().optional().default(0) }))
  .handler(({ data }) => provenance.listDeployments(data.environment, data.provider, data.limit, data.offset) as any);

export const updateDeploymentStatusFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), status: z.string(), liveUrl: z.string().optional() }))
  .handler(({ data }) => provenance.updateDeploymentStatus(data.id, data.status, data.liveUrl) as any);

export const rollbackDeploymentFn = createServerFn({ method: "POST" })
  .validator(z.object({ deploymentId: z.string(), reason: z.string(), triggeredBy: z.string().optional().default("manual") }))
  .handler(({ data }) => provenance.rollbackDeployment(data.deploymentId, data.reason, data.triggeredBy) as any);

export const listRollbacksFn = createServerFn({ method: "POST" })
  .validator(z.object({ deploymentId: z.string() }))
  .handler(({ data }) => provenance.listRollbacks(data.deploymentId) as any);

export const generateCertificateFn = createServerFn({ method: "POST" })
  .validator(z.object({ provenanceId: z.string() }))
  .handler(({ data }) => provenance.generateCertificate(data.provenanceId) as any);

export const verifyCertificateFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) => provenance.verifyCertificate(data.id) as any);

export const getAnalyticsFn = createServerFn({ method: "POST" }).handler(() => provenance.getAnalytics() as any);

export const graphqlFn = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string(), variables: z.any().optional() }))
  .handler(({ data }) => provenance.graphql(data.query, data.variables) as any);
