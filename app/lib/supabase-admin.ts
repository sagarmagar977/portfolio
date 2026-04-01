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

export async function uploadFileToSupabase(options: {
  bucket: string;
  folder: string;
  file: File;
}) {
  const { bucket, folder, file } = options;

  await ensureBucket(bucket);

  const cleanName = sanitizeFileName(file.name || "upload.bin");
  const path = `${folder}/${randomUUID()}-${cleanName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type || undefined,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
