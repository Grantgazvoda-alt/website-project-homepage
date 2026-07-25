import { createFileRoute } from "@tanstack/react-router";
import { graphqlFn } from "../lib/provenance.functions";

export const Route = createFileRoute("/graphql")({
  component: () => null,
  loader: async () => {
    return { message: "POST mutations and queries to /api/v1/graphql" };
  },
});

export const loader = Route.loader;