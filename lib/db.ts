import path from "node:path";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url =
    process.env["TURSO_DATABASE_URL"] ??
    `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

  const adapter = new PrismaLibSql({
    url,
    authToken: process.env["TURSO_AUTH_TOKEN"],
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
