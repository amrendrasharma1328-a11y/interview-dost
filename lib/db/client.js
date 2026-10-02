import { PrismaClient } from "@prisma/client";

const g = globalThis;

// Lazy: the client is created on first use, so pages render a friendly
// "database not ready" notice instead of crashing at import time.
function client() {
  if (!g.__prisma) g.__prisma = new PrismaClient();
  return g.__prisma;
}

export const db = new Proxy({}, { get: (_, prop) => client()[prop] });
