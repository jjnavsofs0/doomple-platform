-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SupportTicketSource" AS ENUM ('CHATBOT', 'PORTAL', 'EMAIL', 'PHONE', 'MANUAL');

-- CreateEnum
CREATE TYPE "ChatbotConversationStatus" AS ENUM ('ACTIVE', 'LEAD_CAPTURED', 'SUPPORT_CAPTURED', 'VERIFIED_CUSTOMER', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChatbotIntent" AS ENUM ('GENERAL', 'SALES', 'SUPPORT');

-- CreateEnum
CREATE TYPE "ChatbotMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ChatbotKnowledgeDocumentType" AS ENUM ('TEXT', 'FILE');

-- CreateEnum
CREATE TYPE "ChatbotKnowledgeDocumentStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "source" "SupportTicketSource" NOT NULL DEFAULT 'CHATBOT',
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "companyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "clientId" TEXT,
    "conversationId" TEXT,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotConversation" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "status" "ChatbotConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "intent" "ChatbotIntent" NOT NULL DEFAULT 'GENERAL',
    "visitorName" TEXT,
    "visitorEmail" TEXT,
    "visitorPhone" TEXT,
    "companyName" TEXT,
    "summary" TEXT,
    "isCustomerVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT,
    "leadId" TEXT,

    CONSTRAINT "ChatbotConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotMessage" (
    "id" TEXT NOT NULL,
    "role" "ChatbotMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "ChatbotMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotOtpRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "ChatbotOtpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotKnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ChatbotKnowledgeDocumentType" NOT NULL,
    "status" "ChatbotKnowledgeDocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "rawText" TEXT,
    "excerpt" TEXT,
    "url" TEXT,
    "storageKey" TEXT,
    "storageProvider" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedById" TEXT,

    CONSTRAINT "ChatbotKnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotKnowledgeChunk" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "ChatbotKnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_conversationId_key" ON "SupportTicket"("conversationId");

-- CreateIndex
CREATE INDEX "SupportTicket_ticketNumber_idx" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE INDEX "SupportTicket_requesterEmail_idx" ON "SupportTicket"("requesterEmail");

-- CreateIndex
CREATE INDEX "SupportTicket_clientId_idx" ON "SupportTicket"("clientId");

-- CreateIndex
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

-- CreateIndex
CREATE INDEX "ChatbotConversation_visitorId_idx" ON "ChatbotConversation"("visitorId");

-- CreateIndex
CREATE INDEX "ChatbotConversation_status_idx" ON "ChatbotConversation"("status");

-- CreateIndex
CREATE INDEX "ChatbotConversation_intent_idx" ON "ChatbotConversation"("intent");

-- CreateIndex
CREATE INDEX "ChatbotConversation_visitorEmail_idx" ON "ChatbotConversation"("visitorEmail");

-- CreateIndex
CREATE INDEX "ChatbotConversation_clientId_idx" ON "ChatbotConversation"("clientId");

-- CreateIndex
CREATE INDEX "ChatbotConversation_leadId_idx" ON "ChatbotConversation"("leadId");

-- CreateIndex
CREATE INDEX "ChatbotConversation_lastMessageAt_idx" ON "ChatbotConversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatbotConversation_createdAt_idx" ON "ChatbotConversation"("createdAt");

-- CreateIndex
CREATE INDEX "ChatbotMessage_conversationId_idx" ON "ChatbotMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatbotMessage_createdAt_idx" ON "ChatbotMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChatbotOtpRequest_conversationId_idx" ON "ChatbotOtpRequest"("conversationId");

-- CreateIndex
CREATE INDEX "ChatbotOtpRequest_email_idx" ON "ChatbotOtpRequest"("email");

-- CreateIndex
CREATE INDEX "ChatbotOtpRequest_expiresAt_idx" ON "ChatbotOtpRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotKnowledgeDocument_slug_key" ON "ChatbotKnowledgeDocument"("slug");

-- CreateIndex
CREATE INDEX "ChatbotKnowledgeDocument_status_idx" ON "ChatbotKnowledgeDocument"("status");

-- CreateIndex
CREATE INDEX "ChatbotKnowledgeDocument_type_idx" ON "ChatbotKnowledgeDocument"("type");

-- CreateIndex
CREATE INDEX "ChatbotKnowledgeDocument_createdAt_idx" ON "ChatbotKnowledgeDocument"("createdAt");

-- CreateIndex
CREATE INDEX "ChatbotKnowledgeDocument_uploadedById_idx" ON "ChatbotKnowledgeDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "ChatbotKnowledgeChunk_documentId_idx" ON "ChatbotKnowledgeChunk"("documentId");

-- CreateIndex
CREATE INDEX "ChatbotKnowledgeChunk_chunkIndex_idx" ON "ChatbotKnowledgeChunk"("chunkIndex");

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatbotConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotConversation" ADD CONSTRAINT "ChatbotConversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotConversation" ADD CONSTRAINT "ChatbotConversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotMessage" ADD CONSTRAINT "ChatbotMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatbotConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotOtpRequest" ADD CONSTRAINT "ChatbotOtpRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatbotConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotKnowledgeDocument" ADD CONSTRAINT "ChatbotKnowledgeDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotKnowledgeChunk" ADD CONSTRAINT "ChatbotKnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ChatbotKnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
