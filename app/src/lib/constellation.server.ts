/**
 * Constellation Engine — Server-Side Data Layer
 * Follows the same owner-scoped pattern as studio-projects.server.ts.
 * Uses D1 for metadata, R2 for code snapshots.
 */
import { ApiJobError } from "@official-intelligence/fnf/errors";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { createServerFnf } from "./fnf.server";
import { encryptSecret, decryptSecret, generateId } from "./constellation-crypto.server";
import { runConstellationPipeline, runSingleAgent } from "./constellation-engine.server";
import type {
  ConstellationProject,
  ConstellationAgentRun,
  ConstellationVersion,
  ConstellationFileTree,
  ConstellationAgentId,
  ConstellationGenerationResult,
} from "./gummy-bear.types";

// ─── Database access (same pattern as studio-projects.server.ts) ───

async function database(): Promise<D1Database | null> {
  try {
    const { bindings } = await import("./bindings.server");
    const db = bindings().DB;
    if (db) return db;
  } catch (error) {
    if (!import.meta.env.DEV) throw error;
  }
  if (import.meta.env.DEV) return null;
  throw new ApiJobError(
    "constellation_database_unavailable",
    "Constellation Engine requires the database to be configured.",
    { status: 503 },
  );
}

async function storage(): Promise<R2Bucket | null> {
  try {
    const { bindings } = await import("./bindings.server");
    const r2 = bindings().STORAGE;
    if (r2) return r2;
  } catch (error) {
    if (!import.meta.env.DEV) throw error;
  }
  if (import.meta.env.DEV) return null;
  return null;
}

async function ownerKey(): Promise<string> {
  try {
    const profile = createServerFnf().profile;
    const user = await profile.getUser();
    if (!user) {
      throw new ApiJobError("auth_required", "Sign in to use the Constellation Engine.", {
        status: 401,
      });
    }
    const workspace = await profile.getCurrentWorkspace().catch(() => null);
    return `user:${user.id}:workspace:${workspace?.id ?? user.workspaceId ?? "personal"}`;
  } catch (error) {
    if (import.meta.env.DEV) return "development:local";
    throw error;
  }
}

// ─── Mapping helpers ───

function mapProject(row: any): ConstellationProject {
  return {
    id: String(row?.id ?? ""),
    workspaceId: String(row?.workspace_id ?? ""),
    name: String(row?.name ?? ""),
    brief: String(row?.brief ?? ""),
    status: String(row?.status ?? "draft") as ConstellationProject["status"],
    techStack: String(row?.tech_stack ?? ""),
    architecturePlan: String(row?.architecture_plan ?? ""),
    githubRepoUrl: String(row?.github_repo_url ?? ""),
    githubRepoName: String(row?.github_repo_name ?? ""),
    deploymentUrl: String(row?.deployment_url ?? ""),
    deploymentProvider: String(row?.deployment_provider ?? ""),
    versionCount: Number(row?.version_count ?? 0),
    latestVersionNumber: Number(row?.latest_version ?? 0),
    createdAt: String(row?.created_at ?? ""),
    updatedAt: String(row?.updated_at ?? ""),
  };
}

function mapAgentRun(row: any): ConstellationAgentRun {
  return {
    id: String(row?.id ?? ""),
    projectId: String(row?.project_id ?? ""),
    versionNumber: Number(row?.version_number ?? 0),
    agentId: String(row?.agent_id ?? "") as ConstellationAgentRun["agentId"],
    status: String(row?.status ?? "pending") as ConstellationAgentRun["status"],
    reasoning: String(row?.reasoning ?? ""),
    outputSummary: String(row?.output_summary ?? ""),
    fileCount: Number(row?.file_count ?? 0),
    durationMs: Number(row?.duration_ms ?? 0),
    errorMessage: row?.error_message ?? null,
    order: Number(row?.run_order ?? 0),
    createdAt: String(row?.created_at ?? ""),
    completedAt: row?.completed_at ? String(row.completed_at) : null,
  };
}

function mapVersion(row: any, agentRuns: ConstellationAgentRun[] = []): ConstellationVersion {
  return {
    id: String(row?.id ?? ""),
    projectId: String(row?.project_id ?? ""),
    versionNumber: Number(row?.version_number ?? 0),
    brief: String(row?.brief ?? ""),
    changelog: String(row?.changelog ?? ""),
    status: String(row?.status ?? "pending") as ConstellationVersion["status"],
    fileCount: Number(row?.file_count ?? 0),
    totalLines: Number(row?.total_lines ?? 0),
    codeSnapshotKey: String(row?.code_snapshot_key ?? ""),
    createdAt: String(row?.created_at ?? ""),
    completedAt: row?.completed_at ? String(row.completed_at) : null,
    agentRuns,
  };
}

// ─── API Key Management ───

export async function setConstellationApiKey(provider: string, key: string): Promise<void> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) throw new ApiJobError("db_unavailable", "Database not available");

  const encrypted = await encryptSecret(key);
  const keyHint = key.slice(-4);
  const id = generateId();

  await db
    .prepare(
      `INSERT INTO constellation_api_keys (id, owner_key, provider, encrypted_key, key_hint)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(owner_key, provider) DO UPDATE SET
         encrypted_key = excluded.encrypted_key,
         key_hint = excluded.key_hint,
         updated_at = datetime('now')`,
    )
    .bind(id, owner, provider, encrypted, keyHint)
    .run();
}

export async function getDecryptedApiKey(provider: string): Promise<string | null> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return null;

  const row = await db
    .prepare("SELECT encrypted_key FROM constellation_api_keys WHERE owner_key = ? AND provider = ?")
    .bind(owner, provider)
    .first<{ encrypted_key: string }>();

  if (!row) return null;
  return decryptSecret(row.encrypted_key);
}

export async function listConstellationApiKeys(): Promise<Array<{ provider: string; keyHint: string; updatedAt: string }>> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return [];

  const result = await db
    .prepare("SELECT provider, key_hint, updated_at FROM constellation_api_keys WHERE owner_key = ?")
    .bind(owner)
    .all<{ provider: string; key_hint: string; updated_at: string }>();

  return (result.results ?? []).map((r) => ({
    provider: r.provider,
    keyHint: r.key_hint,
    updatedAt: r.updated_at,
  }));
}

export async function deleteConstellationApiKey(provider: string): Promise<void> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return;

  await db
    .prepare("DELETE FROM constellation_api_keys WHERE owner_key = ? AND provider = ?")
    .bind(owner, provider)
    .run();
}

// ─── Project CRUD ───

export async function listConstellationProjects(): Promise<ConstellationProject[]> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return [];

  const result = await db
    .prepare(
      `SELECT p.*, COUNT(v.id) as version_count, COALESCE(MAX(v.version_number), 0) as latest_version
       FROM constellation_projects p
       LEFT JOIN constellation_versions v ON v.project_id = p.id AND v.owner_key = p.owner_key
       WHERE p.owner_key = ?
       GROUP BY p.id
       ORDER BY p.updated_at DESC`,
    )
    .bind(owner)
    .all();

  return (result.results ?? []).map(mapProject);
}

export async function getConstellationProject(projectId: string): Promise<ConstellationProject | null> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return null;

  const row = await db
    .prepare(
      `SELECT p.*, COUNT(v.id) as version_count, COALESCE(MAX(v.version_number), 0) as latest_version
       FROM constellation_projects p
       LEFT JOIN constellation_versions v ON v.project_id = p.id AND v.owner_key = p.owner_key
       WHERE p.id = ? AND p.owner_key = ?
       GROUP BY p.id`,
    )
    .bind(projectId, owner)
    .first();

  return row ? mapProject(row) : null;
}

export async function createConstellationProject(
  workspaceId: string,
  name: string,
  brief: string,
): Promise<ConstellationProject> {
  const owner = await ownerKey();
  const db = await database();
  const id = generateId();

  if (!db) throw new ApiJobError("db_unavailable", "Database not available");

  await db
    .prepare(
      "INSERT INTO constellation_projects (id, owner_key, workspace_id, name, brief) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(id, owner, workspaceId, name, brief)
    .run();

  const row = await db
    .prepare("SELECT * FROM constellation_projects WHERE id = ? AND owner_key = ?")
    .bind(id, owner)
    .first();

  if (!row) throw new ApiJobError("project_create_failed", "Could not create project");
  return mapProject(row);
}

export async function updateConstellationProject(
  projectId: string,
  updates: Partial<Pick<ConstellationProject, "name" | "brief" | "status" | "techStack" | "architecturePlan" | "githubRepoUrl" | "githubRepoName" | "deploymentUrl" | "deploymentProvider">>,
): Promise<void> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return;

  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (updates.name !== undefined) { sets.push("name = ?"); values.push(updates.name); }
  if (updates.brief !== undefined) { sets.push("brief = ?"); values.push(updates.brief); }
  if (updates.status !== undefined) { sets.push("status = ?"); values.push(updates.status); }
  if (updates.techStack !== undefined) { sets.push("tech_stack = ?"); values.push(updates.techStack); }
  if (updates.architecturePlan !== undefined) { sets.push("architecture_plan = ?"); values.push(updates.architecturePlan); }
  if (updates.githubRepoUrl !== undefined) { sets.push("github_repo_url = ?"); values.push(updates.githubRepoUrl); }
  if (updates.githubRepoName !== undefined) { sets.push("github_repo_name = ?"); values.push(updates.githubRepoName); }
  if (updates.deploymentUrl !== undefined) { sets.push("deployment_url = ?"); values.push(updates.deploymentUrl); }
  if (updates.deploymentProvider !== undefined) { sets.push("deployment_provider = ?"); values.push(updates.deploymentProvider); }

  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  values.push(projectId, owner);

  await db
    .prepare(`UPDATE constellation_projects SET ${sets.join(", ")} WHERE id = ? AND owner_key = ?`)
    .bind(...values)
    .run();
}

export async function deleteConstellationProject(projectId: string): Promise<void> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return;

  // Delete code snapshots from R2
  const r2 = await storage();
  if (r2) {
    const versions = await db
      .prepare("SELECT code_snapshot_key FROM constellation_versions WHERE project_id = ? AND owner_key = ?")
      .bind(projectId, owner)
      .all<{ code_snapshot_key: string }>();
    for (const v of versions.results ?? []) {
      if (v.code_snapshot_key) {
        await r2.delete(v.code_snapshot_key).catch(() => {});
      }
    }
  }

  await db
    .prepare("DELETE FROM constellation_projects WHERE id = ? AND owner_key = ?")
    .bind(projectId, owner)
    .run();
}

// ─── Version Management ───

export async function listConstellationVersions(projectId: string): Promise<ConstellationVersion[]> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return [];

  const versionsResult = await db
    .prepare(
      `SELECT * FROM constellation_versions WHERE project_id = ? AND owner_key = ? ORDER BY version_number DESC`,
    )
    .bind(projectId, owner)
    .all();

  const versions: ConstellationVersion[] = [];
  for (const vRow of versionsResult.results ?? []) {
    const runsResult = await db
      .prepare(
        `SELECT * FROM constellation_agent_runs WHERE version_id = ? AND owner_key = ? ORDER BY run_order ASC`,
      )
      .bind(String(vRow.id), owner)
      .all();
    versions.push(mapVersion(vRow, (runsResult.results ?? []).map(mapAgentRun)));
  }

  return versions;
}

export async function getVersionCode(versionId: string): Promise<{ files: ConstellationFileTree | null; architecturePlan: string } | null> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return null;

  const version = await db
    .prepare("SELECT * FROM constellation_versions WHERE id = ? AND owner_key = ?")
    .bind(versionId, owner)
    .first<{ code_snapshot_key: string; project_id: string }>();

  if (!version) return null;

  // Get architecture plan from project
  const project = await db
    .prepare("SELECT architecture_plan FROM constellation_projects WHERE id = ? AND owner_key = ?")
    .bind(version.project_id, owner)
    .first<{ architecture_plan: string }>();

  if (!version.code_snapshot_key) {
    return { files: null, architecturePlan: project?.architecture_plan ?? "" };
  }

  const r2 = await storage();
  if (!r2) return { files: null, architecturePlan: project?.architecture_plan ?? "" };

  const obj = await r2.get(version.code_snapshot_key);
  if (!obj) return { files: null, architecturePlan: project?.architecture_plan ?? "" };

  const code = await obj.text();
  return { files: JSON.parse(code) as ConstellationFileTree, architecturePlan: project?.architecture_plan ?? "" };
}

// ─── Generation Pipeline ───

export async function generateConstellation(
  projectId: string,
): Promise<{ versionId: string; versionNumber: number; fileCount: number; totalLines: number }> {
  const owner = await ownerKey();
  const db = await database();
  const r2 = await storage();
  if (!db) throw new ApiJobError("db_unavailable", "Database not available");

  // Get project
  const project = await db
    .prepare("SELECT * FROM constellation_projects WHERE id = ? AND owner_key = ?")
    .bind(projectId, owner)
    .first<{ brief: string; name: string }>();

  if (!project) throw new ApiJobError("project_not_found", "Project not found");

  // Get OpenAI key
  const openaiKey = await getDecryptedApiKey("openai");
  if (!openaiKey) {
    throw new ApiJobError(
      "openai_key_missing",
      "Add your OpenAI API key in the Constellation settings to generate code.",
      { status: 400 },
    );
  }

  // Get next version number
  const latestVersion = await db
    .prepare("SELECT MAX(version_number) as max FROM constellation_versions WHERE project_id = ? AND owner_key = ?")
    .bind(projectId, owner)
    .first<{ max: number | null }>();
  const versionNumber = (latestVersion?.max ?? 0) + 1;
  const versionId = generateId();

  // Create version
  await db
    .prepare(
      "INSERT INTO constellation_versions (id, project_id, owner_key, version_number, brief, status) VALUES (?, ?, ?, ?, ?, 'running')",
    )
    .bind(versionId, projectId, owner, versionNumber, project.brief)
    .run();

  // Update project status
  await db
    .prepare("UPDATE constellation_projects SET status = 'generating', updated_at = datetime('now') WHERE id = ?")
    .bind(projectId)
    .run();

  try {
    // ─── Web Research: search for relevant docs before generating ───
    let researchFindings = "";
    let researchSources: string[] = [];
    try {
      const { researchBrief } = await import("./constellation-engine.server");
      const research = await researchBrief(openaiKey, project.brief);
      researchFindings = research.findings;
      researchSources = research.sources;
    } catch {
      // Research is best-effort
    }

    // Load persistent project memory from previous versions
    let projectMemory: any = { techStack: "", decisions: [], knownErrors: [], fileStructure: [] };
    const memRow = await db
      .prepare("SELECT project_memory, tech_stack, architecture_plan FROM constellation_projects WHERE id = ? AND owner_key = ?")
      .bind(projectId, owner)
      .first<{ project_memory: string; tech_stack: string; architecture_plan: string }>();
    if (memRow?.project_memory) {
      try { projectMemory = JSON.parse(memRow.project_memory); } catch {}
    }
    if (memRow?.tech_stack && !projectMemory.techStack) {
      projectMemory.techStack = memRow.tech_stack;
    }

    // Inject research findings into the brief context
    const briefWithResearch = researchFindings
      ? `${project.brief}\n\n## Research Findings\n${researchFindings}`
      : project.brief;

    // Run the pipeline
    const result: ConstellationGenerationResult = await runConstellationPipeline(
      openaiKey,
      briefWithResearch,
      projectMemory,
      // onAgentStart — create agent run records (awaited to fix race condition)
      async (agentId) => {
        await db
          .prepare(
            `INSERT INTO constellation_agent_runs (id, project_id, version_id, owner_key, version_number, agent_id, status, run_order)
             VALUES (?, ?, ?, ?, ?, ?, 'running', ?)`,
          )
          .bind(generateId(), projectId, versionId, owner, versionNumber, agentId, AGENT_ORDER.indexOf(agentId))
          .run();
      },
      // onAgentComplete — update with results, duration, model, and errors
      async (agentId, agentResult, durationMs, errorMsg) => {
        await db
          .prepare(
            `UPDATE constellation_agent_runs SET
              status = ?,
              reasoning = ?,
              output_summary = ?,
              file_count = ?,
              duration_ms = ?,
              error_message = ?,
              model_used = ?,
              completed_at = datetime('now')
             WHERE version_id = ? AND agent_id = ? AND owner_key = ?`,
          )
          .bind(
            errorMsg ? "error" : "completed",
            agentResult.reasoning,
            agentResult.outputSummary,
            Object.keys(agentResult.files).length,
            durationMs,
            errorMsg ?? null,
            agentResult.modelUsed,
            versionId,
            agentId,
            owner,
          )
          .run();
      },
    );

    // Store code in R2
    const codeKey = `constellation/${projectId}/v${versionNumber}.json`;
    if (r2 && Object.keys(result.files).length > 0) {
      await r2.put(codeKey, JSON.stringify(result.files));
    }

    // Update version
    await db
      .prepare(
        `UPDATE constellation_versions SET
          status = 'completed',
          changelog = ?,
          file_count = ?,
          total_lines = ?,
          code_snapshot_key = ?,
          completed_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(result.summary, result.fileCount, result.totalLines, codeKey, versionId)
      .run();

    // Update project
    await db
      .prepare(
        `UPDATE constellation_projects SET
          status = 'generated',
          tech_stack = ?,
          architecture_plan = ?,
          project_memory = ?,
          updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        result.techStack,
        result.architecturePlan,
        JSON.stringify({
          techStack: result.techStack,
          decisions: (projectMemory as any).decisions ?? [],
          knownErrors: result.agentRuns.filter(r => !r.outputSummary).map(r => r.agentId),
          fileStructure: Object.keys(result.files),
        }),
        projectId,
      )
      .run();

    // ─── Wire into Gummy Bear's existing studio project system ───
    // Automatically create a studio_project entry and link the constellation
    // version's code snapshot so it appears in the existing project infra.
    await linkConstellationToStudioProject(
      db,
      owner,
      projectId,
      versionId,
      versionNumber,
      project.name,
      result.fileCount,
      result.totalLines,
      codeKey,
      result.techStack,
      result.architecturePlan,
      project.brief,
    );

    // ─── Auto-verify the build in the container ───
    // This runs asynchronously — the generation result is returned immediately,
    // and the build verification happens in the background via the container DO.
    // The UI polls getBuildStatusFn to see the result.
    try {
      const { verifyAndFixBuild } = await import("./constellation-build.server");
      // Fire-and-forget — don't block the response on the build
      (async () => {
        try {
          await verifyAndFixBuild(projectId, versionId);
        } catch (buildErr) {
          console.log(`[Constellation] Auto-verify failed for ${projectId} v${versionNumber}: ${buildErr}`);
        }
      })();
    } catch {
      // Build verification is best-effort — don't fail generation if container is unavailable
    }

    return {
      versionId,
      versionNumber,
      fileCount: result.fileCount,
      totalLines: result.totalLines,
    };
  } catch (error) {
    // Update version with error
    await db
      .prepare("UPDATE constellation_versions SET status = 'error', completed_at = datetime('now') WHERE id = ?")
      .bind(versionId)
      .run();

    await db
      .prepare("UPDATE constellation_projects SET status = 'error', updated_at = datetime('now') WHERE id = ?")
      .bind(projectId)
      .run();

    throw error;
  }
}

// ─── Regenerate a single agent's section ───

export async function regenerateAgent(
  projectId: string,
  agentId: ConstellationAgentId,
): Promise<{ versionId: string; versionNumber: number }> {
  const owner = await ownerKey();
  const db = await database();
  const r2 = await storage();
  if (!db) throw new ApiJobError("db_unavailable", "Database not available");

  const project = await db
    .prepare("SELECT * FROM constellation_projects WHERE id = ? AND owner_key = ?")
    .bind(projectId, owner)
    .first<{ brief: string; architecture_plan: string }>();

  if (!project) throw new ApiJobError("project_not_found", "Project not found");

  const openaiKey = await getDecryptedApiKey("openai");
  if (!openaiKey) throw new ApiJobError("openai_key_missing", "OpenAI API key not set");

  // Get latest version's code
  const latestVersion = await db
    .prepare(
      "SELECT id, code_snapshot_key FROM constellation_versions WHERE project_id = ? AND owner_key = ? AND status = 'completed' ORDER BY version_number DESC LIMIT 1",
    )
    .bind(projectId, owner)
    .first<{ id: string; code_snapshot_key: string }>();

  let existingFiles: ConstellationFileTree = {};
  if (latestVersion?.code_snapshot_key && r2) {
    const obj = await r2.get(latestVersion.code_snapshot_key);
    if (obj) {
      existingFiles = JSON.parse(await obj.text()) as ConstellationFileTree;
    }
  }

  // Run single agent
  const result = await runSingleAgent(
    openaiKey,
    agentId,
    project.brief,
    project.architecture_plan,
    existingFiles,
  );

  // Merge new files (replace section)
  const mergedFiles = { ...existingFiles, ...result.files };

  // Create new version
  const latestNum = await db
    .prepare("SELECT MAX(version_number) as max FROM constellation_versions WHERE project_id = ? AND owner_key = ?")
    .bind(projectId, owner)
    .first<{ max: number | null }>();
  const versionNumber = (latestNum?.max ?? 0) + 1;
  const versionId = generateId();
  const codeKey = `constellation/${projectId}/v${versionNumber}.json`;

  if (r2) {
    await r2.put(codeKey, JSON.stringify(mergedFiles));
  }

  const fileCount = Object.keys(mergedFiles).length;
  const totalLines = Object.values(mergedFiles).reduce(
    (sum, file) => sum + file.content.split("\n").length,
    0,
  );

  await db
    .prepare(
      `INSERT INTO constellation_versions (id, project_id, owner_key, version_number, brief, changelog, status, file_count, total_lines, code_snapshot_key, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, datetime('now'))`,
    )
    .bind(
      versionId,
      projectId,
      owner,
      versionNumber,
      project.brief,
      `Regenerated ${agentId} agent`,
      fileCount,
      totalLines,
      codeKey,
    )
    .run();

  // Create agent run record
  await db
    .prepare(
      `INSERT INTO constellation_agent_runs (id, project_id, version_id, owner_key, version_number, agent_id, status, reasoning, output_summary, file_count, run_order, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, 0, datetime('now'))`,
    )
    .bind(generateId(), projectId, versionId, owner, versionNumber, agentId, result.reasoning, result.outputSummary, Object.keys(result.files).length)
    .run();

  // ─── Wire regenerated version into studio project system ───
  const proj = await db
    .prepare("SELECT name, brief, tech_stack, architecture_plan FROM constellation_projects WHERE id = ? AND owner_key = ?")
    .bind(projectId, owner)
    .first<{ name: string; brief: string; tech_stack: string; architecture_plan: string }>();
  if (proj) {
    await linkConstellationToStudioProject(
      db, owner, projectId, versionId, versionNumber,
      proj.name, fileCount, totalLines, codeKey,
      proj.tech_stack, proj.architecture_plan, proj.brief,
    );
  }

  return { versionId, versionNumber };
}

// ─── Duplicate project ───

export async function duplicateConstellationProject(projectId: string): Promise<string> {
  const owner = await ownerKey();
  const db = await database();
  const r2 = await storage();
  if (!db) throw new ApiJobError("db_unavailable", "Database not available");

  const original = await db
    .prepare("SELECT * FROM constellation_projects WHERE id = ? AND owner_key = ?")
    .bind(projectId, owner)
    .first<{ workspace_id: string; name: string; brief: string; tech_stack: string; architecture_plan: string }>();

  if (!original) throw new ApiJobError("project_not_found", "Project not found");

  const newId = generateId();
  await db
    .prepare(
      `INSERT INTO constellation_projects (id, owner_key, workspace_id, name, brief, tech_stack, architecture_plan, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
    )
    .bind(newId, owner, original.workspace_id, `${original.name} (copy)`, original.brief, original.tech_stack, original.architecture_plan)
    .run();

  // Copy latest code snapshot
  const latestVersion = await db
    .prepare("SELECT code_snapshot_key FROM constellation_versions WHERE project_id = ? AND owner_key = ? AND status = 'completed' ORDER BY version_number DESC LIMIT 1")
    .bind(projectId, owner)
    .first<{ code_snapshot_key: string }>();

  if (latestVersion?.code_snapshot_key && r2) {
    const obj = await r2.get(latestVersion.code_snapshot_key);
    if (obj) {
      const code = await obj.text();
      const newKey = `constellation/${newId}/v1.json`;
      await r2.put(newKey, code);
    }
  }

  return newId;
}

// Need to import AGENT_ORDER for the run order index
import { AGENT_ORDER } from "./constellation-engine.server";

// ─── Studio Project Integration ───
// When a constellation build completes, automatically create a studio_project
// entry and link the code snapshot so it appears in Gummy Bear's existing
// project infrastructure (sidebar Projects list, project workspace views).

/**
 * Creates or reuses a studio_project for a constellation project and links
 * the latest version's code snapshot to it. Called after every successful
 * generation or regeneration.
 */
async function linkConstellationToStudioProject(
  db: D1Database,
  owner: string,
  constellationProjectId: string,
  versionId: string,
  versionNumber: number,
  projectName: string,
  fileCount: number,
  totalLines: number,
  codeSnapshotKey: string,
  techStack: string,
  architecturePlan: string,
  brief: string,
): Promise<void> {
  // Check if a studio project already exists for this constellation project
  const existingLink = await db
    .prepare(
      "SELECT studio_project_id FROM studio_constellation_links WHERE owner_key = ? AND constellation_project_id = ? ORDER BY created_at DESC LIMIT 1",
    )
    .bind(owner, constellationProjectId)
    .first<{ studio_project_id: string }>();

  let studioProjectId: string;

  if (existingLink) {
    // Reuse the existing studio project
    studioProjectId = existingLink.studio_project_id;
    // Update its timestamp
    await db
      .prepare("UPDATE studio_projects SET updated_at = datetime('now') WHERE id = ? AND owner_key = ?")
      .bind(studioProjectId, owner)
      .run();
  } else {
    // Create a new studio project
    studioProjectId = generateId();
    await db
      .prepare(
        "INSERT INTO studio_projects (id, owner_key, name) VALUES (?, ?, ?)",
      )
      .bind(studioProjectId, owner, projectName)
      .run();
  }

  // Create the link record (one per version)
  await db
    .prepare(
      `INSERT INTO studio_constellation_links
        (id, owner_key, studio_project_id, constellation_project_id, constellation_version_id,
         version_number, file_count, total_lines, code_snapshot_key, tech_stack, architecture_plan, brief)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      generateId(),
      owner,
      studioProjectId,
      constellationProjectId,
      versionId,
      versionNumber,
      fileCount,
      totalLines,
      codeSnapshotKey,
      techStack,
      architecturePlan,
      brief,
    )
    .run();
}

// ─── Fetch studio project's constellation code ───

export interface StudioProjectCodeResult {
  studioProjectId: string;
  studioProjectName: string;
  constellationProjectId: string;
  versionNumber: number;
  fileCount: number;
  totalLines: number;
  techStack: string;
  architecturePlan: string;
  brief: string;
  files: ConstellationFileTree | null;
  allVersions: Array<{
    versionId: string;
    versionNumber: number;
    fileCount: number;
    totalLines: number;
    createdAt: string;
  }>;
}

export async function getStudioProjectCode(
  studioProjectId: string,
): Promise<StudioProjectCodeResult | null> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return null;

  // Get the studio project
  const project = await db
    .prepare("SELECT id, name FROM studio_projects WHERE id = ? AND owner_key = ?")
    .bind(studioProjectId, owner)
    .first<{ id: string; name: string }>();

  if (!project) return null;

  // Get all constellation links for this studio project (all versions)
  const linksResult = await db
    .prepare(
      `SELECT * FROM studio_constellation_links
       WHERE owner_key = ? AND studio_project_id = ?
       ORDER BY version_number DESC`,
    )
    .bind(owner, studioProjectId)
    .all();

  const links = linksResult.results ?? [];
  if (links.length === 0) return null;

  // Latest version
  const latest = links[0] as any;

  // Fetch code from R2
  let files: ConstellationFileTree | null = null;
  if (latest.code_snapshot_key) {
    const r2 = await storage();
    if (r2) {
      const obj = await r2.get(latest.code_snapshot_key);
      if (obj) {
        try {
          files = JSON.parse(await obj.text()) as ConstellationFileTree;
        } catch {
          files = null;
        }
      }
    }
  }

  return {
    studioProjectId: project.id,
    studioProjectName: project.name,
    constellationProjectId: String(latest.constellation_project_id ?? ""),
    versionNumber: Number(latest.version_number ?? 0),
    fileCount: Number(latest.file_count ?? 0),
    totalLines: Number(latest.total_lines ?? 0),
    techStack: String(latest.tech_stack ?? ""),
    architecturePlan: String(latest.architecture_plan ?? ""),
    brief: String(latest.brief ?? ""),
    files,
    allVersions: links.map((link: any) => ({
      versionId: String(link.constellation_version_id ?? ""),
      versionNumber: Number(link.version_number ?? 0),
      fileCount: Number(link.file_count ?? 0),
      totalLines: Number(link.total_lines ?? 0),
      createdAt: String(link.created_at ?? ""),
    })),
  };
}

// ─── List studio projects with constellation code ───

export interface StudioProjectWithCode {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  hasConstellationCode: boolean;
  latestVersionNumber: number;
  fileCount: number;
  totalLines: number;
  techStack: string;
  constellationProjectId: string;
}

export async function listStudioProjectsWithCode(): Promise<StudioProjectWithCode[]> {
  const owner = await ownerKey();
  const db = await database();
  if (!db) return [];

  // Get all studio projects
  const projectsResult = await db
    .prepare(
      `SELECT p.id, p.name, p.created_at, p.updated_at
       FROM studio_projects p
       WHERE p.owner_key = ?
       ORDER BY p.updated_at DESC`,
    )
    .bind(owner)
    .all<{ id: string; name: string; created_at: string; updated_at: string }>();

  const projects = projectsResult.results ?? [];
  const result: StudioProjectWithCode[] = [];

  for (const project of projects) {
    // Check for constellation links
    const link = await db
      .prepare(
        `SELECT constellation_project_id, version_number, file_count, total_lines, tech_stack
         FROM studio_constellation_links
         WHERE owner_key = ? AND studio_project_id = ?
         ORDER BY version_number DESC LIMIT 1`,
      )
      .bind(owner, project.id)
      .first<{
        constellation_project_id: string;
        version_number: number;
        file_count: number;
        total_lines: number;
        tech_stack: string;
      }>();

    result.push({
      id: project.id,
      name: project.name,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      hasConstellationCode: !!link,
      latestVersionNumber: link?.version_number ?? 0,
      fileCount: link?.file_count ?? 0,
      totalLines: link?.total_lines ?? 0,
      techStack: link?.tech_stack ?? "",
      constellationProjectId: link?.constellation_project_id ?? "",
    });
  }

  return result;
}
