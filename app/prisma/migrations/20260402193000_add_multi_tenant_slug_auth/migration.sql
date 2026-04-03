ALTER TABLE "AdminUser"
ALTER COLUMN "passwordHash" SET NOT NULL;

ALTER TABLE "Profile"
ADD COLUMN "slug" TEXT;

UPDATE "Profile"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    COALESCE(NULLIF("fullName", ''), 'portfolio') || '-' || SUBSTRING("id" FROM 1 FOR 6),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  )
)
WHERE "slug" IS NULL;

ALTER TABLE "Profile"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");
