import { PrismaClient } from "@prisma/client";

// Create a singleton PrismaClient instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;