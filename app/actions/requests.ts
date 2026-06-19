"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { itemRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimiter";
import { extractValidationErrors } from "@/lib/helpers";
import type { ActionResponse } from "@/lib/types";

export async function createItemRequest(
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const rateLimit = await checkRateLimit(
    `create-request:${user.id}`,
    10,
    60 * 1000
  );
  if (!rateLimit.success) {
    return {
      error:
        "Terlalu banyak mengirim postingan permintaan. Silakan coba lagi nanti.",
    };
  }

  const validation = itemRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    budget: formData.get("budget"),
    category: formData.get("category"),
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { title, description, budget, category } = validation.data;

  try {
    await prisma.itemRequest.create({
      data: {
        title,
        description,
        budget,
        category,
        authorId: user.id,
      },
    });

    revalidatePath("/marketplace/requests");
    return { success: true };
  } catch (error: unknown) {
    console.error("[REQUEST ERROR] createItemRequest failed:", error);
    return {
      error:
        "Gagal memposting permintaan. Terjadi kesalahan pada server.",
    };
  }
}

export async function deleteItemRequest(
  id: string
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  try {
    const request = await prisma.itemRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return { error: "Postingan tidak ditemukan." };
    }

    if (request.authorId !== user.id && user.role !== "ADMIN") {
      return {
        error: "Akses ditolak: Anda bukan pemilik postingan ini.",
      };
    }

    await prisma.itemRequest.delete({ where: { id } });

    revalidatePath("/marketplace/requests");
    return { success: true };
  } catch (error: unknown) {
    console.error("[REQUEST ERROR] deleteItemRequest failed:", error);
    return {
      error:
        "Gagal menghapus postingan. Terjadi kesalahan pada server.",
    };
  }
}
