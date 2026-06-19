"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import type { ActionResponse } from "@/lib/types";

export async function reportListingAction(
  productId: string,
  reason: string
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  if (!reason.trim()) {
    return { error: "Alasan laporan tidak boleh kosong." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return { error: "Produk tidak ditemukan." };
    }

    await prisma.report.create({
      data: {
        reporterId: user.id,
        targetProductId: productId,
        targetUserId: product.sellerId,
        reason,
        status: "PENDING",
      },
    });

    console.log(
      `[AUDIT] User ${user.name} (${user.id}) reported product ${productId}`
    );
    return { success: true };
  } catch (error: unknown) {
    console.error("[REPORT ERROR] reportListingAction failed:", error);
    return {
      error: "Gagal mengirim laporan. Terjadi kesalahan pada server.",
    };
  }
}

export async function blockUserAction(
  targetUserId: string
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  if (user.id === targetUserId) {
    return { error: "Anda tidak dapat memblokir akun Anda sendiri." };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) {
      return { error: "Pengguna tidak ditemukan." };
    }

    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId: targetUserId,
        },
      },
    });

    if (existingBlock) {
      return { success: true };
    }

    await prisma.block.create({
      data: {
        blockerId: user.id,
        blockedId: targetUserId,
      },
    });

    console.log(`[AUDIT] User ${user.id} blocked user ${targetUserId}`);
    revalidatePath("/chat");
    return { success: true };
  } catch (error: unknown) {
    console.error("[BLOCK ERROR] blockUserAction failed:", error);
    return {
      error:
        "Gagal memblokir pengguna. Terjadi kesalahan pada server.",
    };
  }
}

export async function unblockUserAction(
  targetUserId: string
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  try {
    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId: targetUserId,
        },
      },
    });

    console.log(`[AUDIT] User ${user.id} unblocked user ${targetUserId}`);
    revalidatePath("/chat");
    return { success: true };
  } catch (error: unknown) {
    console.error("[BLOCK ERROR] unblockUserAction failed:", error);
    return {
      error: "Gagal membuka blokir. Terjadi kesalahan pada server.",
    };
  }
}
