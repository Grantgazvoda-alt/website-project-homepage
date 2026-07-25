// Provenance Intelligence System — Server Functions
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as provenance from "./provenance.server";

// ─── Records ───

export const createRecordFn = createServerFn({ method: "POST" })
  .validator(provenance.recordSchema)
  .handler(({ data }) => provenance.createRecord(data));

export const listRecordsFn = createServerFn({ method: "GET" })
  .validator(z.object({
    source: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().default(50),
    offset: z.number().int().min(0).optional().default(0),
  }))
  .handler(({ data }) => provenance.listRecords(data.source, data.limit, data.offset));

export const getRecordFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) => provenance.getRecord(data.id));

export const deleteRecordFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) => provenance.deleteRecord(data.id));

// ─── Lineage ───

export const traceLineageFn = createServerFn({ method: "GET" })
  .validator(z.object({ contentHash: z.string() }))
  .handler(({ data }) => provenance.traceLineage(data.contentHash));

export const traceByFileFn = createServerFn({ method: "GET" })
  .validator(z.object({ filePath: z.string(), repoName: z.string().optional() }))
  .handler(({ data }) => provenance.traceByFile(data.filePath, data.repoName));

// ─── Deployments ───

export const createDeploymentFn = createServerFn({ method: "POST" })
  .validator(z.object({ provenance_id: z.string(), environment: z.string(), provider: z.string(), live_url: z.string().optional(), branch: z.string().optional(), deployed_by: z.string().optional() }))
  .handler(({ data }) => provenance.createDeployment(data));

export const listDeploymentsFn = createServerFn({ method: "GET" })
  .validator(z.object({ environment: z.string().optional(), provider: z.string().optional(), limit: z.number().int().optional().default(50), offset: z.number().int().optional().default(0) }))
  .handler(({ data }) => provenance.listDeployments(data.environment, data.provider, data.limit, data.offset));

export const updateDeploymentStatusFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), status: z.string(), liveUrl: z.string().optional() }))
  .handler(({ data }) => provenance.updateDeploymentStatus(data.id, data.status, data.liveUrl));

// ─── Rollbacks ───

export const rollbackDeploymentFn = createServerFn({ method: "POST" })
  .validator(z.object({ deploymentId: z.string(), reason: z.string(), triggeredBy: z.string().optional().default("manual") }))
  .handler(({ data }) => provenance.rollbackDeployment(data.deploymentId, data.reason, data.triggeredBy));

export const listRollbacksFn = createServerFn({ method: "GET" })
  .validator(z.object({ deploymentId: z.string() }))
  .handler(({ data }) => provenance.listRollbacks(data.deploymentId));

// ─── Certificates ───

export const generateCertificateFn = createServerFn({ method: "POST" })
  .validator(z.object({ provenanceId: z.string() }))
  .handler(({ data }) => provenance.generateCertificate(data.provenanceId));

export const verifyCertificateFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) => provenance.verifyCertificate(data.id));

// ─── Analytics ───

export const getAnalyticsFn = createServerFn({ method: "GET" }).handler(() => provenance.getAnalytics());

// ─── GraphQL ───

export const graphqlFn = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string(), variables: z.any().optional() }))
  .handler(({ data }) => provenance.graphql(data.query, data.variables));