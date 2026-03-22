import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrismaClient() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}
