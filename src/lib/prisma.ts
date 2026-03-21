import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function hasCurrentDelegates(client: PrismaClient) {
  return (
    "chatbotConversation" in client &&
    "chatbotMessage" in client &&
    "chatbotOtpRequest" in client
  );
}

export const prisma =
  globalForPrisma.prisma && hasCurrentDelegates(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
