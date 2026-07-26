// Seed endpoint — populates the database with sample data
import { createServerFn } from "@tanstack/react-start";
import { seedDatabase } from "../../../lib/seed.server";

export const seedFn = createServerFn({ method: "POST" }).handler(async () => {
  return seedDatabase() as any;
});