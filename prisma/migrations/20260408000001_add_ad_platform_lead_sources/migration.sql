-- Add ad-platform and CSV import values to LeadSource enum
-- Idempotent: uses DO/BEGIN/EXCEPTION pattern

DO $$ BEGIN
  ALTER TYPE "LeadSource" ADD VALUE 'FACEBOOK_ADS';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "LeadSource" ADD VALUE 'GOOGLE_ADS';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "LeadSource" ADD VALUE 'INSTAGRAM_ADS';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "LeadSource" ADD VALUE 'LINKEDIN_ADS';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "LeadSource" ADD VALUE 'CSV_IMPORT';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
