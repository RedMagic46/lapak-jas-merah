import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "NIM atau Email wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "Nama Lengkap minimal 3 karakter").max(100, "Nama Lengkap terlalu panjang"),
  nim: z.string().regex(/^\d+$/, "NIM hanya boleh berisi angka").min(8, "NIM minimal 8 karakter").max(20, "NIM maksimal 20 karakter"),
  email: z.string()
    .email("Format email tidak valid")
    .refine(
      (email) => email.endsWith("@webmail.umm.ac.id") || email.endsWith("@umm.ac.id"),
      "Harus menggunakan email resmi UMM (@webmail.umm.ac.id atau @umm.ac.id)"
    ),
  password: z.string().min(6, "Password minimal 6 karakter").max(100, "Password terlalu panjang"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export const productSchema = z.object({
  title: z.string().min(3, "Judul barang minimal 3 karakter").max(100, "Judul barang terlalu panjang"),
  description: z.string().min(10, "Deskripsi barang minimal 10 karakter"),
  price: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().nonnegative("Harga harus bernilai positif atau 0")
  ),
  category: z.string().min(1, "Kategori wajib dipilih"),
  faculty: z.string().optional().nullable(),
  imageUrl: z.string().url("Format URL gambar tidak valid").optional().or(z.literal("")).nullable(),
});

export const transactionSchema = z.object({
  meetupLocation: z.string().min(3, "Lokasi Safe Zone COD minimal 3 karakter").max(150, "Lokasi terlalu panjang"),
  meetupTime: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional().nullable(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Pesan tidak boleh kosong").max(1000, "Pesan maksimal 1000 karakter"),
  productId: z.string().optional().nullable(),
});

export const faqSchema = z.object({
  question: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  answer: z.string().min(5, "Jawaban minimal 5 karakter"),
});

export const verificationSchema = z.object({
  nim: z.string().regex(/^\d+$/, "NIM hanya boleh berisi angka").min(8, "NIM minimal 8 karakter"),
  ktmUrl: z.string().url("Link dokumen KTM harus berupa URL gambar yang valid").refine((val) => {
    return val.startsWith("http://") || val.startsWith("https://");
  }, "URL dokumen KTM harus menggunakan protokol http atau https"),
});

export const reviewSchema = z.object({
  rating: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().int().min(1, "Rating minimal 1 bintang").max(5, "Rating maksimal 5 bintang")
  ),
  comment: z.string().min(5, "Ulasan minimal 5 karakter").max(500, "Ulasan maksimal 500 karakter"),
});

export const itemRequestSchema = z.object({
  title: z.string().min(3, "Judul permintaan minimal 3 karakter").max(100, "Judul terlalu panjang"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  budget: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("Budget harus lebih besar dari 0")
  ),
  category: z.string().refine((val) => val === "WTB" || val === "JASTIP", {
    message: "Kategori harus WTB atau JASTIP",
  }),
});

export const profileSchema = z.object({
  name: z.string().min(3, "Nama Lengkap minimal 3 karakter").max(100, "Nama Lengkap terlalu panjang"),
  faculty: z.string().max(100, "Nama fakultas terlalu panjang").optional().or(z.literal("")).nullable(),
  avatarUrl: z.string().url("Format URL foto profil tidak valid").refine((val) => {
    if (!val) return true;
    return val.startsWith("http://") || val.startsWith("https://");
  }, "URL foto profil harus menggunakan protokol http atau https").optional().or(z.literal("")).nullable(),
});

