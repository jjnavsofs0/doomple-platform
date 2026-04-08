-- CreateTable LeadCommunication (idempotent)
CREATE TABLE IF NOT EXISTS "LeadCommunication" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "direction" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LeadCommunication_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "LeadCommunication_leadId_idx" ON "LeadCommunication"("leadId");
CREATE INDEX IF NOT EXISTS "LeadCommunication_userId_idx" ON "LeadCommunication"("userId");
CREATE INDEX IF NOT EXISTS "LeadCommunication_createdAt_idx" ON "LeadCommunication"("createdAt");

-- Foreign Keys
DO $$ BEGIN
  ALTER TABLE "LeadCommunication" ADD CONSTRAINT "LeadCommunication_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "LeadCommunication" ADD CONSTRAINT "LeadCommunication_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
