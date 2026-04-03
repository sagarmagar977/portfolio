ALTER TABLE "Profile"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publishedSlug" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "publishedSnapshot" JSONB;

CREATE UNIQUE INDEX "Profile_publishedSlug_key" ON "Profile"("publishedSlug");
