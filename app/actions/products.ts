"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { productSchema, reviewSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimiter";
import { extractValidationErrors, DEFAULT_PRODUCT_IMAGE } from "@/lib/helpers";
import type { ActionResponse } from "@/lib/types";

export async function createProduct(
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const rateLimit = await checkRateLimit(
    `create-product:${user.id}`,
    10,
    60 * 1000
  );
  if (!rateLimit.success) {
    return {
      error:
        "Terlalu banyak membuat postingan produk. Silakan coba lagi nanti.",
    };
  }

  const rawTransactionType =
    (formData.get("transactionType") as string) || "SALE";
  const rawBarterWith = formData.get("barterWith")
    ? (formData.get("barterWith") as string)
    : null;
  const rawAutoBumpEnabled = formData.get("autoBumpEnabled") === "true";
  const rawAutoBumpInterval = parseInt(
    (formData.get("autoBumpInterval") as string) || "6",
    10
  );
  const rawIsAuction = formData.get("isAuction") === "true";
  const rawAuctionEndsStr = formData.get("auctionEnds") as string;
  const rawAuctionEnds = rawAuctionEndsStr
    ? new Date(rawAuctionEndsStr)
    : null;
  const rawStartingBid = parseFloat(
    (formData.get("startingBid") as string) || "0"
  );
  const rawIsService = formData.get("isService") === "true";

  const validation = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: rawIsAuction
      ? rawStartingBid.toString()
      : rawTransactionType === "DONATION"
        ? "0"
        : formData.get("price"),
    category: formData.get("category"),
    faculty: formData.get("faculty"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { title, description, price, category, faculty, imageUrl } =
    validation.data;
  const finalImageUrl = imageUrl || DEFAULT_PRODUCT_IMAGE;

  try {
    if (user.role === "BUYER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "SELLER" },
      });
    }

    await prisma.product.create({
      data: {
        title,
        description,
        price,
        category,
        faculty: faculty || null,
        imageUrl: finalImageUrl,
        sellerId: user.id,
        status: "ACTIVE",
        transactionType: rawTransactionType,
        barterWith: rawBarterWith,
        autoBumpEnabled: rawAutoBumpEnabled,
        autoBumpInterval: rawAutoBumpInterval,
        isAuction: rawIsAuction,
        auctionEnds: rawAuctionEnds,
        startingBid: rawStartingBid,
        currentBid: 0,
        isService: rawIsService,
      },
    });

    revalidatePath("/marketplace");
    revalidatePath("/seller/products");
    return { success: true };
  } catch (error: unknown) {
    console.error("[PRODUCT ERROR] createProduct failed:", error);
    return {
      error: "Gagal membuat produk. Terjadi kesalahan pada server.",
    };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const rawTransactionType =
    (formData.get("transactionType") as string) || "SALE";
  const rawBarterWith = formData.get("barterWith")
    ? (formData.get("barterWith") as string)
    : null;
  const rawAutoBumpEnabled = formData.get("autoBumpEnabled") === "true";
  const rawAutoBumpInterval = parseInt(
    (formData.get("autoBumpInterval") as string) || "6",
    10
  );
  const rawIsAuction = formData.get("isAuction") === "true";
  const rawAuctionEndsStr = formData.get("auctionEnds") as string;
  const rawAuctionEnds = rawAuctionEndsStr
    ? new Date(rawAuctionEndsStr)
    : null;
  const rawStartingBid = parseFloat(
    (formData.get("startingBid") as string) || "0"
  );
  const rawIsService = formData.get("isService") === "true";

  const validation = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: rawIsAuction
      ? rawStartingBid.toString()
      : rawTransactionType === "DONATION"
        ? "0"
        : formData.get("price"),
    category: formData.get("category"),
    faculty: formData.get("faculty"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { title, description, price, category, faculty, imageUrl } =
    validation.data;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.sellerId !== user.id) {
      return {
        error:
          "Produk tidak ditemukan atau Anda bukan pemilik produk ini.",
      };
    }

    await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price,
        category,
        faculty: faculty || null,
        imageUrl: imageUrl || product.imageUrl,
        transactionType: rawTransactionType,
        barterWith: rawBarterWith,
        autoBumpEnabled: rawAutoBumpEnabled,
        autoBumpInterval: rawAutoBumpInterval,
        isAuction: rawIsAuction,
        auctionEnds: rawAuctionEnds,
        startingBid: rawStartingBid,
        isService: rawIsService,
      },
    });

    revalidatePath("/marketplace");
    revalidatePath(`/marketplace/${id}`);
    revalidatePath("/seller/products");
    return { success: true };
  } catch (error: unknown) {
    console.error("[PRODUCT ERROR] updateProduct failed:", error);
    return {
      error:
        "Gagal memperbarui produk. Terjadi kesalahan pada server.",
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.sellerId !== user.id) {
      return { error: "Akses ditolak: Anda bukan pemilik produk ini." };
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/marketplace");
    revalidatePath("/seller/products");
    return { success: true };
  } catch (error: unknown) {
    console.error("[PRODUCT ERROR] deleteProduct failed:", error);
    return {
      error: "Gagal menghapus produk. Terjadi kesalahan pada server.",
    };
  }
}

export async function toggleWishlist(
  productId: string
): Promise<ActionResponse<{ added: boolean }>> {
  const user = await getAuthUser();
  if (!user)
    return {
      error: "Silakan login terlebih dahulu untuk menambah favorit.",
    };

  try {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      revalidatePath("/marketplace");
      revalidatePath(`/marketplace/${productId}`);
      return { success: true, data: { added: false } };
    } else {
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      revalidatePath("/marketplace");
      revalidatePath(`/marketplace/${productId}`);
      return { success: true, data: { added: true } };
    }
  } catch (error: unknown) {
    console.error("[PRODUCT ERROR] toggleWishlist failed:", error);
    return {
      error: "Gagal mengubah wishlist. Terjadi kesalahan pada server.",
    };
  }
}

export async function sundulProductAction(
  productId: string
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.sellerId !== user.id) {
      return { error: "Akses ditolak: Anda bukan pemilik produk ini." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { createdAt: new Date() },
    });

    revalidatePath("/marketplace");
    revalidatePath("/seller/products");
    return { success: true };
  } catch (error: unknown) {
    console.error("[PRODUCT ERROR] sundulProductAction failed:", error);
    return {
      error: "Gagal melakukan sundul. Terjadi kesalahan pada server.",
    };
  }
}

export async function createReviewAction(
  productId: string,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const validation = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { rating, comment } = validation.data;

  try {
    const completedTx = await prisma.transaction.findFirst({
      where: {
        productId,
        buyerId: user.id,
        status: "COMPLETED",
      },
    });

    if (!completedTx) {
      return {
        error:
          "Anda hanya bisa mengulas produk yang telah Anda beli melalui transaksi COD selesai.",
      };
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.id,
      },
    });

    if (existingReview) {
      return { error: "Anda sudah mengulas produk ini." };
    }

    await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        comment,
      },
    });

    revalidatePath(`/marketplace/${productId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[REVIEW ERROR] createReviewAction failed:", error);
    return {
      error: "Gagal membuat ulasan. Terjadi kesalahan pada server.",
    };
  }
}

export async function placeBidAction(
  productId: string,
  amount: number
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const rateLimit = await checkRateLimit(`bid:${user.id}`, 30, 60 * 1000);
  if (!rateLimit.success) {
    return {
      error:
        "Terlalu banyak mengajukan penawaran lelang. Silakan coba lagi nanti.",
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isAuction) {
      return { error: "Produk lelang tidak ditemukan." };
    }

    if (product.sellerId === user.id) {
      return {
        error:
          "Anda tidak dapat mengajukan penawaran lelang untuk produk Anda sendiri.",
      };
    }

    if (product.auctionEnds && new Date() > new Date(product.auctionEnds)) {
      return { error: "Lelang sudah berakhir." };
    }

    const minAmount = Math.max(product.startingBid, product.currentBid);
    if (amount <= minAmount) {
      return {
        error: `Penawaran Anda harus lebih besar dari Rp ${minAmount.toLocaleString("id-ID")}`,
      };
    }

    await prisma.$transaction([
      prisma.auctionBid.create({
        data: {
          productId,
          bidderId: user.id,
          amount,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { currentBid: amount },
      }),
    ]);

    revalidatePath(`/marketplace/${productId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[BID ERROR] placeBidAction failed:", error);
    return {
      error:
        "Gagal memproses penawaran lelang. Terjadi kesalahan pada server.",
    };
  }
}
