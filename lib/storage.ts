import { createClient } from "@supabase/supabase-js";
import { MAX_FILE_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from "./helpers";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface UploadResult {
  url?: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  bucketName: string = "lapak-jas-merah",
  folder: string = "products"
): Promise<UploadResult> {
  if (!supabase) {
    return {
      error:
        "Penyimpanan cloud Supabase tidak dikonfigurasi. Silakan periksa environment variable.",
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      error:
        "Format file tidak didukung. Harap upload gambar JPEG, PNG, WEBP, atau GIF.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      error: "Ukuran file terlalu besar. Maksimal ukuran gambar adalah 5MB.",
    };
  }

  try {
    const fileExtension = file.name.split(".").pop() || "jpg";
    const secureName = `${folder}/${crypto.randomUUID()}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(secureName, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.error("[STORAGE ERROR] Supabase upload failed:", error);
      return { error: "Gagal mengupload gambar ke penyimpanan cloud." };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl };
  } catch (err: unknown) {
    console.error("[STORAGE EXCEPTION] Upload error:", err);
    return {
      error: "Terjadi kesalahan internal saat memproses upload file.",
    };
  }
}
