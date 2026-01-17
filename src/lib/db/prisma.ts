import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton with PostgreSQL Adapter
 *
 * Prisma 7+ requires a database adapter. This uses the pg adapter
 * with connection pooling for Supabase PostgreSQL.
 *
 * In development, Next.js hot reloads can create multiple PrismaClient instances,
 * exhausting database connections. This singleton pattern ensures only one instance
 * exists throughout the application lifecycle.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  // Use the pooler connection URL for runtime
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString,
    max: 10, // Maximum number of connections in the pool
  });

  const adapter = new PrismaPg(pool);

  return {
    client: new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    }),
    pool,
  };
}

if (!globalForPrisma.prisma) {
  const { client, pool } = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.pool = pool;
}

export const prisma = globalForPrisma.prisma;
export default prisma;
