// src/server/db/client.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../env.mjs";
console.log(env.DATABASE_URL);
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}