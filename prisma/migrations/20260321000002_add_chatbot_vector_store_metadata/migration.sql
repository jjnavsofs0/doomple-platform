ALTER TABLE "ChatbotKnowledgeDocument"
ADD COLUMN "openaiFileId" TEXT,
ADD COLUMN "openaiFilename" TEXT;

CREATE UNIQUE INDEX "ChatbotKnowledgeDocument_openaiFileId_key"
ON "ChatbotKnowledgeDocument"("openaiFileId");
