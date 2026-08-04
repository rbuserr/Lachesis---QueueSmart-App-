import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and paste your Neon pooled connection string.",
    );
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

/** Shared Prisma client — import this from server modules / API routes. */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
