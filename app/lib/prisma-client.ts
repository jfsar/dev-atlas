import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "~/generated/prisma/client";

/**
 * Build a Prisma client bound to an explicit connection string. Prisma 7
 * requires a driver adapter; this factory keeps a single place that knows how
 * to construct one, so the app singleton and the seed script can target
 * different connections (pooled vs. unpooled) without duplicating setup.
 */
export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
