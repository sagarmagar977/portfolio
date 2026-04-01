import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase Storage environment variables are not set.");
}

const bucketCache = new Set<string>();

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureBucket(bucket: string) {
  if (bucketCache.has(bucket)) {
    return;
  }

  const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }

  const exists = existingBuckets.some((item) => item.name === bucket);

  if (!exists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
    });

    if (createError) {
      throw new Error(`Failed to create bucket ${bucket}: ${createError.message}`);
    }
  }

  bucketCache.add(bucket);
}

function buildStoragePath(folder: string, fileName: string) {
  const cleanName = sanitizeFileName(fileName || "upload.bin");
  return `${folder}/${randomUUID()}-${cleanName}`;
}

async function uploadBinary(options: {
  bucket: string;
  folder: string;
  fileName: string;
  bytes: Buffer;
  contentType?: string;
}) {
  const { bucket, folder, fileName, bytes, contentType } = options;

  await ensureBucket(bucket);

  const path = buildStoragePath(folder, fileName);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFileToSupabase(options: {
  bucket: string;
  folder: string;
  file: File;
}) {
  const { bucket, folder, file } = options;
  const arrayBuffer = await file.arrayBuffer();

  return uploadBinary({
    bucket,
    folder,
    fileName: file.name || "upload.bin",
    bytes: Buffer.from(arrayBuffer),
    contentType: file.type || undefined,
  });
}

export async function uploadBufferToSupabase(options: {
  bucket: string;
  folder: string;
  fileName: string;
  bytes: Buffer;
  contentType?: string;
}) {
  return uploadBinary(options);
}

export function getStoragePathFromPublicUrl(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith(`${supabaseUrl}/storage/v1/object/public/`)) {
    return null;
  }

  const prefix = `${supabaseUrl}/storage/v1/object/public/`;
  const remainder = publicUrl.slice(prefix.length);
  const firstSlashIndex = remainder.indexOf("/");

  if (firstSlashIndex === -1) {
    return null;
  }

  const bucket = remainder.slice(0, firstSlashIndex);
  const path = remainder.slice(firstSlashIndex + 1);

  if (!bucket || !path) {
    return null;
  }

  return { bucket, path };
}

export async function deleteStorageFileByPublicUrl(publicUrl: string | null | undefined) {
  const storagePath = getStoragePathFromPublicUrl(publicUrl);

  if (!storagePath) {
    return;
  }

  const { error } = await supabaseAdmin.storage.from(storagePath.bucket).remove([storagePath.path]);

  if (error) {
    throw new Error(`Failed to delete storage file: ${error.message}`);
  }
}
