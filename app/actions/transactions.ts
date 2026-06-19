"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { transactionSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimiter";
import { extractValidationErrors } from "@/lib/helpers";
import type { ActionResponse } from "@/lib/types";

export async function createTransactionRequest(
  productId: string,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const rateLimit = await checkRateLimit(
    `create-tx:${user.id}`,
    5,
    60 * 1000
  );
  if (!rateLimit.success) {
    return {
      error:
        "Terlalu banyak membuat permintaan transaksi. Silakan coba lagi nanti.",
    };
  }

  const validation = transactionSchema.safeParse({
    meetupLocation: formData.get("meetupLocation"),
    meetupTime: formData.get("meetupTime"),
    notes: formData.get("notes"),
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { meetupLocation, meetupTime, notes } = validation.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { error: "Produk tidak ditemukan." };
    }

    if (product.sellerId === user.id) {
      return {
        error:
          "Anda tidak dapat mengajukan transaksi untuk produk Anda sendiri.",
      };
    }

    const rawPaymentMethod =
      (formData.get("paymentMethod") as string) || "COD_CASH";

    const transaction = await prisma.transaction.create({
      data: {
        productId,
        buyerId: user.id,
        sellerId: product.sellerId,
        meetupLocation,
        meetupTime: meetupTime || null,
        notes: notes || null,
        status: "PENDING",
        paymentMethod: rawPaymentMethod,
        paymentStatus: "UNPAID",
      },
    });

    await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: product.sellerId,
        productId,
        content: `[SISTEM] Saya mengajukan transaksi COD untuk produk "${product.title}" di lokasi "${meetupLocation}"${meetupTime ? ` pada ${meetupTime.toLocaleString("id-ID")}` : ""}. Catatan: ${notes || "-"}`,
      },
    });

    revalidatePath("/chat");
    revalidatePath("/seller/orders");
    return { success: true, data: transaction.id };
  } catch (error: unknown) {
    console.error(
      "[TRANSACTION ERROR] createTransactionRequest failed:",
      error
    );
    return {
      error: "Gagal membuat transaksi. Terjadi kesalahan pada server.",
    };
  }
}

export async function updateTransactionStatus(
  transactionId: string,
  status: string
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { product: true },
    });

    if (!tx) {
      return { error: "Transaksi tidak ditemukan." };
    }

    const isSeller = tx.sellerId === user.id;
    const isBuyer = tx.buyerId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isSeller && !isBuyer && !isAdmin) {
      return { error: "Akses ditolak." };
    }

    if (status === "ACCEPTED" && !isSeller && !isAdmin) {
      return {
        error: "Hanya penjual yang dapat menerima tawaran COD.",
      };
    }

    if (status === "COMPLETED" && !isSeller && !isAdmin) {
      return {
        error:
          "Hanya penjual yang dapat mengonfirmasi transaksi selesai.",
      };
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });

    if (status === "COMPLETED") {
      await prisma.product.update({
        where: { id: tx.productId },
        data: { status: "SOLD" },
      });

      if (tx.paymentMethod !== "COD_CASH") {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { paymentStatus: "RELEASED" },
        });
      }
    }

    const statusText =
      status === "ACCEPTED"
        ? "diterima oleh penjual"
        : status === "COMPLETED"
          ? "dinyatakan selesai"
          : "dibatalkan";
    await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: isSeller ? tx.buyerId : tx.sellerId,
        productId: tx.productId,
        content: `[SISTEM] Transaksi COD untuk "${tx.product.title}" telah ${statusText}.`,
      },
    });

    revalidatePath("/chat");
    revalidatePath("/seller/orders");
    revalidatePath(`/marketplace/${tx.productId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error(
      "[TRANSACTION ERROR] updateTransactionStatus failed:",
      error
    );
    return {
      error:
        "Gagal memperbarui status transaksi. Terjadi kesalahan pada server.",
    };
  }
}

export async function uploadPaymentProof(
  transactionId: string,
  proofUrl: string
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  try {
    const parsedUrl = new URL(proofUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return { error: "Format URL bukti pembayaran tidak valid. Harus menggunakan http atau https." };
    }
  } catch {
    return { error: "Format URL bukti pembayaran tidak valid." };
  }

  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx || tx.buyerId !== user.id) {
      return {
        error: "Transaksi tidak ditemukan atau Anda tidak berwenang.",
      };
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus: "PAID",
        paymentProofUrl: proofUrl,
      },
    });

    revalidatePath("/chat");
    revalidatePath("/seller/orders");
    return { success: true };
  } catch (error: unknown) {

    console.error("[ESCROW ERROR] uploadPaymentProof failed:", error);
    return {
      error:
        "Gagal mengupload bukti pembayaran. Terjadi kesalahan pada server.",
    };
  }
}

export async function verifyEscrowPayment(
  transactionId: string,
  approve: boolean
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Dilarang: Akses Admin Diperlukan" };
  }

  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus: approve ? "VERIFIED" : "UNPAID",
        paymentProofUrl: approve ? undefined : null,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ESCROW ERROR] verifyEscrowPayment failed:", error);
    return {
      error:
        "Gagal memverifikasi pembayaran. Terjadi kesalahan pada server.",
    };
  }
}
