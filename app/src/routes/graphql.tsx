import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/graphql")({
  component: () => (
    <div className="min-h-dvh flex items-center justify-center bg-[#0a0a0f] text-[#f5f5f7]">
      <div className="glass rounded-xl p-8 text-center max-w-lg">
        <h1 className="text-xl font-bold">GraphQL API</h1>
        <p className="mt-2 text-sm text-[#98989d]">POST queries and mutations to the GraphQL endpoint.</p>
        <pre className="mt-4 rounded-lg bg-[rgba(10,10,15,0.6)] p-4 text-left text-xs font-mono text-[#98989d]">
{`POST /api/v1/graphql
{
  "query": "query { analytics { total passed failed } }"
}`}
        </pre>
      </div>
    </div>
  ),
});
