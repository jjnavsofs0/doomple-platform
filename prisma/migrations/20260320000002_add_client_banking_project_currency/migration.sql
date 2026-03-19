-- Migration: add_client_banking_project_currency
-- Adds client banking/tax fields and project currency column missing from earlier migrations.

-- Client: banking and tax fields
ALTER TABLE "Client"
  ADD COLUMN IF NOT EXISTS "panNumber"         TEXT,
  ADD COLUMN IF NOT EXISTS "bankName"          TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "ifscCode"          TEXT;

-- Project: currency field
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
