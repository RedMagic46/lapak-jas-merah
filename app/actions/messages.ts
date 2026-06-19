"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimiter";
import { extractValidationErrors } from "@/lib/helpers";
import type { ActionResponse, Partner } from "@/lib/types";
import type { Product } from "@prisma/client";

export async function sendMessage(
  receiverId: string,
  content: string,
  productId?: string | null
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const rateLimit = await checkRateLimit(
    `send-message:${user.id}`,
    30,
    60 * 1000
  );
  if (!rateLimit.success) {
    return {
      error: "Terlalu banyak mengirim pesan. Silakan coba lagi nanti.",
    };
  }

  const validation = messageSchema.safeParse({
    content,
    productId: productId || null,
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { content: cleanContent, productId: cleanProductId } = validation.data;

  try {
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: receiverId },
          { blockerId: receiverId, blockedId: user.id },
        ],
      },
    });

    if (isBlocked) {
      return {
        error:
          "Pesan tidak dapat dikirim karena Anda memblokir pengguna ini, atau Anda telah diblokir.",
      };
    }

    const msg = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content: cleanContent,
        productId: cleanProductId || null,
      },
    });

    revalidatePath("/chat");
    revalidatePath("/seller/chat");
    return { success: true, data: msg };
  } catch (error: unknown) {
    console.error("[MESSAGE ERROR] sendMessage failed:", error);
    return {
      error: "Gagal mengirim pesan. Terjadi kesalahan pada server.",
    };
  }
}

export async function getInboxUsers(): Promise<Partner[]> {
  const user = await getAuthUser();
  if (!user) return [];

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    const partnersMap = new Map<string, Partner>();

    const productIdsSet = new Set<string>();
    for (const msg of messages) {
      if (msg.productId) {
        productIdsSet.add(msg.productId);
      }
    }

    const productsList =
      productIdsSet.size > 0
        ? await prisma.product.findMany({
            where: { id: { in: Array.from(productIdsSet) } },
          })
        : [];

    const productsMap = new Map<string, Product>();
    for (const prod of productsList) {
      productsMap.set(prod.id, prod);
    }

    for (const msg of messages) {
      const partner =
        msg.senderId === user.id ? msg.receiver : msg.sender;
      if (!partner) continue;

      if (!partnersMap.has(partner.id)) {
        const product = msg.productId
          ? productsMap.get(msg.productId)
          : null;

        partnersMap.set(partner.id, {
          partnerId: partner.id,
          name: partner.name,
          avatarUrl: partner.avatarUrl,
          lastMessage: msg.content,
          time: msg.createdAt,
          isRead: msg.receiverId === user.id ? msg.isRead : true,
          productId: msg.productId,
          productTitle: product?.title || "",
          productPrice: product?.price || 0,
          productImage: product?.imageUrl || "",
          type: product?.sellerId === user.id ? "SELLING" : "BUYING",
        });
      }
    }

    return Array.from(partnersMap.values());
  } catch (error: unknown) {
    console.error("Failed to fetch inbox:", error);
    return [];
  }
}
