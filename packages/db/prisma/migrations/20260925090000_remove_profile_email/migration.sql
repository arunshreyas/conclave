DROP INDEX IF EXISTS "UserProfile_email_key";
ALTER TABLE "UserProfile" DROP COLUMN IF EXISTS "email";
ALTER TABLE "UserProfile" ALTER COLUMN "birthday" DROP NOT NULL;