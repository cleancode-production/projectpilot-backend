-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false,
ALTER COLUMN "lastLogin" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "profileImageURL" DROP NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT true,
ALTER COLUMN "authProvider" DROP NOT NULL,
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "timezone" DROP NOT NULL,
ALTER COLUMN "providerId" DROP NOT NULL;
