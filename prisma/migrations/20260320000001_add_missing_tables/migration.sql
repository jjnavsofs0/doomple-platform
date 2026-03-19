-- Migration: add_missing_tables
-- Adds new enums, columns, and tables that exist in schema but were not included in earlier migrations.
-- All statements are idempotent (safe to run multiple times).

-- ==================== NEW ENUMS (safe, skip if already exists) ====================

DO $$ BEGIN
  CREATE TYPE "EmailVerificationStatus" AS ENUM ('PENDING', 'VERIFIED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AccountErasureRequestStatus" AS ENUM ('REQUESTED', 'RESTRICTED', 'ANONYMIZED', 'RETAINED_FOR_FINANCE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CookieConsentDecision" AS ENUM ('ACCEPT_ALL', 'ESSENTIAL_ONLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AppErrorSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AppErrorSource" AS ENUM ('CLIENT', 'SERVER', 'RENDER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==================== ALTER EXISTING TABLES ====================

-- User: new columns
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "avatarStorageKey"           TEXT,
  ADD COLUMN IF NOT EXISTS "avatarStorageProvider"      TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt"            TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "transactionalEmailsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "marketingEmailsEnabled"     BOOLEAN NOT NULL DEFAULT true;

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "emailVerificationStatus" "EmailVerificationStatus" NOT NULL DEFAULT 'VERIFIED';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Quotation: currency + soft-delete
ALTER TABLE "Quotation"
  ADD COLUMN IF NOT EXISTS "currency"     TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS "deletedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deleteReason" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedById" TEXT;

-- Invoice: currency
ALTER TABLE "Invoice"
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';

-- ==================== NEW TABLES ====================

-- AdminAuditLog
CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
    "id"         TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId"   TEXT NOT NULL,
    "action"     TEXT NOT NULL,
    "summary"    TEXT NOT NULL,
    "metadata"   JSONB,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"     TEXT,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- EmailChangeRequest
CREATE TABLE IF NOT EXISTS "EmailChangeRequest" (
    "id"         TEXT NOT NULL,
    "newEmail"   TEXT NOT NULL,
    "token"      TEXT NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    "userId"     TEXT NOT NULL,
    CONSTRAINT "EmailChangeRequest_pkey" PRIMARY KEY ("id")
);

-- AccountErasureRequest
CREATE TABLE IF NOT EXISTS "AccountErasureRequest" (
    "id"               TEXT NOT NULL,
    "requestedReason"  TEXT NOT NULL,
    "retentionReason"  TEXT,
    "internalNotes"    TEXT,
    "requestedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restrictedAt"     TIMESTAMP(3),
    "resolvedAt"       TIMESTAMP(3),
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    "requestedById"    TEXT,
    "reviewedById"     TEXT,
    "userId"           TEXT NOT NULL,
    CONSTRAINT "AccountErasureRequest_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "AccountErasureRequest" ADD COLUMN "status" "AccountErasureRequestStatus" NOT NULL DEFAULT 'REQUESTED';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- CookieConsentRecord
CREATE TABLE IF NOT EXISTS "CookieConsentRecord" (
    "id"            TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "source"        TEXT NOT NULL DEFAULT 'banner',
    "preferences"   JSONB,
    "ipAddress"     TEXT,
    "userAgent"     TEXT,
    "acceptedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId"     TEXT NOT NULL,
    "userId"        TEXT,
    CONSTRAINT "CookieConsentRecord_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "CookieConsentRecord" ADD COLUMN "decision" "CookieConsentDecision" NOT NULL DEFAULT 'ACCEPT_ALL';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- AppErrorLog
CREATE TABLE IF NOT EXISTS "AppErrorLog" (
    "id"            TEXT NOT NULL,
    "fingerprint"   TEXT NOT NULL,
    "title"         TEXT NOT NULL,
    "message"       TEXT NOT NULL,
    "route"         TEXT,
    "area"          TEXT,
    "method"        TEXT,
    "statusCode"    INTEGER,
    "stack"         TEXT,
    "metadata"      JSONB,
    "occurrences"   INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAlertedAt" TIMESTAMP(3),
    "isResolved"    BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    "userId"        TEXT,
    "resolvedById"  TEXT,
    CONSTRAINT "AppErrorLog_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "AppErrorLog" ADD COLUMN "severity" "AppErrorSeverity" NOT NULL DEFAULT 'ERROR';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AppErrorLog" ADD COLUMN "source" "AppErrorSource" NOT NULL DEFAULT 'SERVER';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ==================== UNIQUE CONSTRAINTS ====================

CREATE UNIQUE INDEX IF NOT EXISTS "EmailChangeRequest_token_key" ON "EmailChangeRequest"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "AppErrorLog_fingerprint_key"  ON "AppErrorLog"("fingerprint");

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS "User_emailVerificationStatus_idx" ON "User"("emailVerificationStatus");
CREATE INDEX IF NOT EXISTS "Quotation_deletedAt_idx"          ON "Quotation"("deletedAt");
CREATE INDEX IF NOT EXISTS "Quotation_deletedById_idx"        ON "Quotation"("deletedById");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_entityType_idx"     ON "AdminAuditLog"("entityType");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_entityId_idx"       ON "AdminAuditLog"("entityId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_action_idx"         ON "AdminAuditLog"("action");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx"      ON "AdminAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_userId_idx"         ON "AdminAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "EmailChangeRequest_userId_idx"    ON "EmailChangeRequest"("userId");
CREATE INDEX IF NOT EXISTS "EmailChangeRequest_newEmail_idx"  ON "EmailChangeRequest"("newEmail");
CREATE INDEX IF NOT EXISTS "EmailChangeRequest_expiresAt_idx" ON "EmailChangeRequest"("expiresAt");
CREATE INDEX IF NOT EXISTS "EmailChangeRequest_verifiedAt_idx" ON "EmailChangeRequest"("verifiedAt");
CREATE INDEX IF NOT EXISTS "AccountErasureRequest_userId_idx"      ON "AccountErasureRequest"("userId");
CREATE INDEX IF NOT EXISTS "AccountErasureRequest_status_idx"      ON "AccountErasureRequest"("status");
CREATE INDEX IF NOT EXISTS "AccountErasureRequest_requestedAt_idx" ON "AccountErasureRequest"("requestedAt");
CREATE INDEX IF NOT EXISTS "AccountErasureRequest_resolvedAt_idx"  ON "AccountErasureRequest"("resolvedAt");
CREATE INDEX IF NOT EXISTS "CookieConsentRecord_visitorId_idx"     ON "CookieConsentRecord"("visitorId");
CREATE INDEX IF NOT EXISTS "CookieConsentRecord_userId_idx"        ON "CookieConsentRecord"("userId");
CREATE INDEX IF NOT EXISTS "CookieConsentRecord_policyVersion_idx" ON "CookieConsentRecord"("policyVersion");
CREATE INDEX IF NOT EXISTS "CookieConsentRecord_acceptedAt_idx"    ON "CookieConsentRecord"("acceptedAt");
CREATE INDEX IF NOT EXISTS "AppErrorLog_severity_idx"              ON "AppErrorLog"("severity");
CREATE INDEX IF NOT EXISTS "AppErrorLog_source_idx"                ON "AppErrorLog"("source");
CREATE INDEX IF NOT EXISTS "AppErrorLog_isResolved_idx"            ON "AppErrorLog"("isResolved");
CREATE INDEX IF NOT EXISTS "AppErrorLog_lastSeenAt_idx"            ON "AppErrorLog"("lastSeenAt");
CREATE INDEX IF NOT EXISTS "AppErrorLog_route_idx"                 ON "AppErrorLog"("route");
CREATE INDEX IF NOT EXISTS "AppErrorLog_userId_idx"                ON "AppErrorLog"("userId");
CREATE INDEX IF NOT EXISTS "AppErrorLog_resolvedById_idx"          ON "AppErrorLog"("resolvedById");

-- ==================== FOREIGN KEYS (safe, skip if already exists) ====================

DO $$ BEGIN
  ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_deletedById_fkey"
    FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "EmailChangeRequest" ADD CONSTRAINT "EmailChangeRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AccountErasureRequest" ADD CONSTRAINT "AccountErasureRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CookieConsentRecord" ADD CONSTRAINT "CookieConsentRecord_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AppErrorLog" ADD CONSTRAINT "AppErrorLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AppErrorLog" ADD CONSTRAINT "AppErrorLog_resolvedById_fkey"
    FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
