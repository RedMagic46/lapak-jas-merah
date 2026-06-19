"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { faqSchema } from "@/lib/validation";
import { extractValidationErrors, BCRYPT_SALT_ROUNDS } from "@/lib/helpers";
import type { ActionResponse, ProductStatus } from "@/lib/types";

async function requireAdmin(): Promise<void> {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Dilarang: Akses Admin Diperlukan");
  }
}

export async function verifyUserKTM(
  verificationId: string,
  status: string
): Promise<ActionResponse> {
  await requireAdmin();

  if (status !== "VERIFIED" && status !== "REJECTED") {
    return { error: "Status verifikasi tidak valid." };
  }

  try {
    const request = await prisma.verificationRequest.findUnique({
      where: { id: verificationId },
    });

    if (!request) {
      return { error: "Permintaan verifikasi tidak ditemukan." };
    }

    await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: verificationId },
        data: { status },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: { isVerified: status === "VERIFIED" },
      }),
    ]);

    console.log(
      `[AUDIT] Admin verified KTM for userId ${request.userId} as ${status}`
    );

    revalidatePath("/admin/verifications");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] verifyUserKTM failed:", error);
    return {
      error:
        "Gagal memproses verifikasi KTM. Terjadi kesalahan pada server.",
    };
  }
}

export async function deleteUser(userId: string): Promise<ActionResponse> {
  await requireAdmin();

  try {
    const currentUser = await getAuthUser();
    if (currentUser?.id === userId) {
      return { error: "Anda tidak dapat menghapus akun Anda sendiri." };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`[AUDIT] Admin deleted user with id ${userId}`);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] deleteUser failed:", error);
    return {
      error: "Gagal menghapus pengguna. Terjadi kesalahan pada server.",
    };
  }
}

export async function moderateProduct(
  productId: string,
  status: string
): Promise<ActionResponse> {
  await requireAdmin();

  const validStatuses: ProductStatus[] = [
    "ACTIVE",
    "SOLD",
    "ARCHIVED",
    "FLAGGED",
  ];
  if (!validStatuses.includes(status as ProductStatus)) {
    return { error: "Status produk tidak valid." };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    console.log(
      `[AUDIT] Admin moderated product ${productId} to status ${status}`
    );

    revalidatePath("/admin/products");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] moderateProduct failed:", error);
    return {
      error: "Gagal memoderasi produk. Terjadi kesalahan pada server.",
    };
  }
}

export async function deleteReview(
  reviewId: string
): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.review.delete({
      where: { id: reviewId },
    });

    console.log(`[AUDIT] Admin deleted review ${reviewId}`);

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] deleteReview failed:", error);
    return {
      error: "Gagal menghapus ulasan. Terjadi kesalahan pada server.",
    };
  }
}

export async function deleteForumPost(
  postId: string
): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.forumPost.delete({
      where: { id: postId },
    });

    console.log(`[AUDIT] Admin deleted forum post ${postId}`);

    revalidatePath("/admin/forum");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] deleteForumPost failed:", error);
    return {
      error: "Gagal menghapus forum post. Terjadi kesalahan pada server.",
    };
  }
}

export async function createFAQ(
  question: string,
  answer: string
): Promise<ActionResponse> {
  await requireAdmin();

  const validation = faqSchema.safeParse({ question, answer });
  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  try {
    await prisma.fAQ.create({
      data: { question, answer },
    });

    console.log(`[AUDIT] Admin created FAQ: "${question}"`);

    revalidatePath("/admin/faq");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] createFAQ failed:", error);
    return {
      error: "Gagal membuat FAQ. Terjadi kesalahan pada server.",
    };
  }
}

export async function deleteFAQ(faqId: string): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.fAQ.delete({
      where: { id: faqId },
    });

    console.log(`[AUDIT] Admin deleted FAQ with id ${faqId}`);

    revalidatePath("/admin/faq");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] deleteFAQ failed:", error);
    return {
      error: "Gagal menghapus FAQ. Terjadi kesalahan pada server.",
    };
  }
}

export async function toggleProductPromotion(
  productId: string,
  promote: boolean
): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        isPromoted: promote,
        isFeatured: promote,
      },
    });

    console.log(
      `[AUDIT] Admin set product ${productId} promotion status to ${promote}`
    );

    revalidatePath("/admin/promotions");
    revalidatePath("/");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] toggleProductPromotion failed:", error);
    return {
      error:
        "Gagal mengubah promosi produk. Terjadi kesalahan pada server.",
    };
  }
}

const adminUpdateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3, "Nama Lengkap minimal 3 karakter").max(100, "Nama Lengkap terlalu panjang"),
  nim: z.string().regex(/^\d+$/, "NIM hanya boleh berisi angka").min(8, "NIM minimal 8 karakter").max(20, "NIM maksimal 20 karakter"),
  email: z.string()
    .email("Format email tidak valid")
    .refine(
      (email) => email.endsWith("@webmail.umm.ac.id") || email.endsWith("@umm.ac.id"),
      "Harus menggunakan email resmi UMM (@webmail.umm.ac.id atau @umm.ac.id)"
    ),
  password: z.string().min(6, "Password minimal 6 karakter").max(100, "Password terlalu panjang").optional().or(z.literal("")),
  role: z.string().refine((val) => val === "BUYER" || val === "SELLER" || val === "ADMIN", "Role tidak valid"),
  faculty: z.string().max(100, "Nama fakultas terlalu panjang").optional().or(z.literal("")).nullable(),
  isVerified: z.boolean(),
  isEmailVerified: z.boolean(),
});

export async function updateUser(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  await requireAdmin();

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    nim: formData.get("nim"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    faculty: formData.get("faculty"),
    isVerified: formData.get("isVerified") === "true",
    isEmailVerified: formData.get("isEmailVerified") === "true",
  };

  const validation = adminUpdateUserSchema.safeParse(rawData);
  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { id, name, nim, email, password, role, faculty, isVerified, isEmailVerified } = validation.data;

  try {
    // Check unique constraints (email and nim)
    const existingUser = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: [{ email }, { nim }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return { error: "Email sudah terdaftar pada pengguna lain." };
      }
      if (existingUser.nim === nim) {
        return { error: "NIM sudah terdaftar pada pengguna lain." };
      }
    }

    const updateData: any = {
      name,
      nim,
      email,
      role,
      faculty: faculty || null,
      isVerified,
      isEmailVerified,
    };

    if (password) {
      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      updateData.password = passwordHash;
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    console.log(`[AUDIT] Admin updated user with id ${id}`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ADMIN ERROR] updateUser failed:", error);
    return {
      error: "Gagal memperbarui data pengguna. Terjadi kesalahan pada server.",
    };
  }
}
