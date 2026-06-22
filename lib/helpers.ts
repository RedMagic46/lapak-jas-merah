import { z } from "zod";

export function extractValidationErrors(
  result: z.ZodSafeParseError<unknown>
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((err) => {
    const field = err.path[0] as string;
    if (!errors[field]) errors[field] = [];
    errors[field].push(err.message);
  });
  return errors;
}

export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_EXPIRY_DAYS = 7;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const COOKIE_NAME = "ljm_session";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const SAFE_ZONE_LOCATIONS = [
  "Gedung Rektorat UMM",
  "Perpustakaan Pusat UMM",
  "Masjid KH. Bedjo Muhammadiyah UMM",
  "GKB 1 UMM",
  "Kantin Dome UMM",
] as const;

export const PRODUCT_CATEGORIES = [
  "Buku Kuliah",
  "Jas Lab",
  "Elektronik",
  "Kost",
  "Tutor Sebaya",
  "Lelang Cepat",
  "Atribut & Pakaian",
  "Alat Tulis & Kantor",
  "Jasa & Cetak",
  "Hobi & Olahraga",
] as const;

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop";
