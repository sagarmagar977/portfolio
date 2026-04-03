ALTER TABLE "Profile"
ADD COLUMN "templateKey" TEXT NOT NULL DEFAULT 'classic',
ADD COLUMN "roles" TEXT[] NOT NULL DEFAULT ARRAY['developer', 'creator']::TEXT[];

ALTER TABLE "Beat"
ADD COLUMN "externalUrl" TEXT;

CREATE TABLE "Business" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "businessType" TEXT,
  "description" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "imageUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PhotoProject" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "collection" TEXT,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "projectUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PhotoProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MotionProject" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "toolName" TEXT,
  "description" TEXT NOT NULL,
  "previewImageUrl" TEXT,
  "previewGifUrl" TEXT,
  "previewVideoUrl" TEXT,
  "projectUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MotionProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Artwork" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "medium" TEXT,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "collectionUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Business"
ADD CONSTRAINT "Business_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PhotoProject"
ADD CONSTRAINT "PhotoProject_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MotionProject"
ADD CONSTRAINT "MotionProject_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Artwork"
ADD CONSTRAINT "Artwork_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
