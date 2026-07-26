import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { registerUser, loginUser, createApiKey, listApiKeys, deleteApiKey, updateApiKeyScope, listApiKeysByScope } from "./provenance-auth.server";

export const registerFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1).max(100) }))
  .handler(async ({ data }) => {
    const { checkRateLimit } = await import("./provenance-auth.server");
    const rateLimit = checkRateLimit("register:" + data.email, 5, 60000);
    if (!rateLimit.allowed) throw new Error("Rate limited. Try again later.");
    return registerUser(data.email, data.password, data.name) as any;
  });

export const loginFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string() }))
  .handler(async ({ data }) => {
    const { checkRateLimit } = await import("./provenance-auth.server");
    const rateLimit = checkRateLimit("login:" + data.email, 10, 60000);
    if (!rateLimit.allowed) throw new Error("Rate limited. Try again later.");
    return loginUser(data.email, data.password) as any;
  });

export const createApiKeyFn = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().min(1), role: z.string().optional().default("user"), scopes: z.string().optional().default("read") }))
  .handler(async ({ data }) => createApiKey("user-local", data.name, data.role, data.scopes) as any);

export const listApiKeysFn = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => listApiKeys(data.userId) as any);

export const deleteApiKeyFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => deleteApiKey(data.id) as any);

export const updateApiKeyScopeFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), scopes: z.string() }))
  .handler(async ({ data }) => updateApiKeyScope(data.id, data.scopes) as any);

export const listApiKeysByScopeFn = createServerFn({ method: "POST" })
  .validator(z.object({ scope: z.string() }))
  .handler(async ({ data }) => listApiKeysByScope(data.scope) as any);
