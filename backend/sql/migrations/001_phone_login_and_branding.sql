-- Adds organization branding (logo) and switches login identifier from email to phone number.
-- Safe to run against an existing populated database (no data loss).

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Backfill the super admin's phone number (update the email below if different)
UPDATE users SET phone_number = '917970976777'
WHERE email = 'replysingh2015@gmail.com' AND phone_number IS NULL;

ALTER TABLE users ALTER COLUMN phone_number SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_number_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;
