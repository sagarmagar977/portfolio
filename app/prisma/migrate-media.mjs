import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

const { uploadBufferToSupabase } = await import("../lib/supabase-admin.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set for media migration.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const publicRoot = path.join(appRoot, "public");

function getContentType(fileName) {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".mp3":
      return "audio/mpeg";
    case ".pdf":
      return "application/pdf";
    default:
      return undefined;
  }
}

function isLocalAssetUrl(url) {
  return typeof url === "string" && url.startsWith("/assets/");
}

async function uploadLocalAsset(options) {
  const { url, bucket, folder } = options;
  const relativePath = url.replace(/^\//, "");
  const absolutePath = path.join(publicRoot, relativePath);
  const bytes = await readFile(absolutePath);
  const fileName = path.basename(absolutePath);

  return uploadBufferToSupabase({
    bucket,
    folder,
    fileName,
    bytes,
    contentType: getContentType(fileName),
  });
}

async function main() {
  const profile = await prisma.profile.findFirst();

  if (!profile) {
    console.log("No profile found. Nothing to migrate.");
    return;
  }

  if (isLocalAssetUrl(profile.profileImageUrl)) {
    const uploadedUrl = await uploadLocalAsset({
      url: profile.profileImageUrl,
      bucket: "profile",
      folder: "images",
    });

    await prisma.profile.update({
      where: { id: profile.id },
      data: { profileImageUrl: uploadedUrl },
    });

    console.log(`Migrated profile image -> ${uploadedUrl}`);
  }

  if (isLocalAssetUrl(profile.cvFileUrl)) {
    const uploadedUrl = await uploadLocalAsset({
      url: profile.cvFileUrl,
      bucket: "cv",
      folder: "files",
    });

    await prisma.profile.update({
      where: { id: profile.id },
      data: { cvFileUrl: uploadedUrl },
    });

    console.log(`Migrated CV -> ${uploadedUrl}`);
  }

  const projects = await prisma.project.findMany();

  for (const project of projects) {
    if (!isLocalAssetUrl(project.imageUrl)) {
      continue;
    }

    const uploadedUrl = await uploadLocalAsset({
      url: project.imageUrl,
      bucket: "projects",
      folder: "images",
    });

    await prisma.project.update({
      where: { id: project.id },
      data: { imageUrl: uploadedUrl },
    });

    console.log(`Migrated project ${project.title} image -> ${uploadedUrl}`);
  }

  const beats = await prisma.beat.findMany();

  for (const beat of beats) {
    let nextCoverImageUrl = beat.coverImageUrl;
    let nextAudioUrl = beat.audioUrl;

    if (isLocalAssetUrl(beat.coverImageUrl)) {
      nextCoverImageUrl = await uploadLocalAsset({
        url: beat.coverImageUrl,
        bucket: "beats",
        folder: "covers",
      });

      console.log(`Migrated beat ${beat.title} cover -> ${nextCoverImageUrl}`);
    }

    if (isLocalAssetUrl(beat.audioUrl)) {
      nextAudioUrl = await uploadLocalAsset({
        url: beat.audioUrl,
        bucket: "beats",
        folder: "audio",
      });

      console.log(`Migrated beat ${beat.title} audio -> ${nextAudioUrl}`);
    }

    if (nextCoverImageUrl !== beat.coverImageUrl || nextAudioUrl !== beat.audioUrl) {
      await prisma.beat.update({
        where: { id: beat.id },
        data: {
          coverImageUrl: nextCoverImageUrl,
          audioUrl: nextAudioUrl,
        },
      });
    }
  }

  console.log("Media migration complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
