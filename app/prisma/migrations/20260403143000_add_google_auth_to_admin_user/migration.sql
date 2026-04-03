ALTER TABLE "AdminUser"
ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "AdminUser"
ADD COLUMN "googleId" TEXT;

CREATE UNIQUE INDEX "AdminUser_googleId_key" ON "AdminUser"("googleId");
