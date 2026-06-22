"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { extractValidationErrors } from "@/lib/helpers";
import type { ActionResponse } from "@/lib/types";

const forumPostSchema = z.object({
  title: z.string().min(5, "Judul diskusi minimal 5 karakter").max(100, "Judul diskusi maksimal 100 karakter"),
  content: z.string().min(10, "Isi diskusi minimal 10 karakter").max(5000, "Isi diskusi maksimal 5000 karakter"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  isAnonymous: z.boolean().optional(),
});

export async function createForumPostAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse<string>> {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Anda harus login untuk membuat diskusi." };
  }

  const validation = forumPostSchema.safeParse({
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    isAnonymous: formData.get("isAnonymous") === "true",
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { title, content, category, isAnonymous } = validation.data;

  try {
    const newPost = await prisma.forumPost.create({
      data: {
        title,
        content,
        category,
        isAnonymous: !!isAnonymous,
        authorId: user.id,
        authorName: user.name,
      },
    });

    revalidatePath("/forum");
    revalidatePath("/");
    return { success: true, data: newPost.id };
  } catch (error: unknown) {
    console.error("[FORUM ERROR] createForumPostAction failed:", error);
    return { error: "Gagal membuat diskusi. Terjadi kesalahan pada server." };
  }
}

export async function likeForumPostAction(postId: string): Promise<ActionResponse> {
  try {
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
    revalidatePath(`/forum/${postId}`);
    revalidatePath("/forum");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[FORUM ERROR] likeForumPostAction failed:", error);
    return { error: "Gagal menyukai diskusi." };
  }
}

const forumReplySchema = z.object({
  content: z.string().min(3, "Komentar minimal 3 karakter").max(1000, "Komentar maksimal 1000 karakter"),
});

export async function createForumReplyAction(
  postId: string,
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Anda harus login untuk memberikan balasan." };
  }

  const validation = forumReplySchema.safeParse({
    content: formData.get("content") as string,
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { content } = validation.data;

  try {
    await prisma.$transaction([
      prisma.forumReply.create({
        data: {
          postId,
          content,
          authorId: user.id,
          authorName: user.name,
        },
      }),
      prisma.forumPost.update({
        where: { id: postId },
        data: {
          repliesCount: {
            increment: 1,
          },
        },
      }),
    ]);

    revalidatePath(`/forum/${postId}`);
    revalidatePath("/forum");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("[FORUM ERROR] createForumReplyAction failed:", error);
    return { error: "Gagal mengirimkan balasan. Terjadi kesalahan pada server." };
  }
}

export async function deleteForumPostAction(postId: string): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Anda harus login untuk menghapus diskusi." };
  }

  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { error: "Diskusi tidak ditemukan." };
    }

    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return { error: "Anda tidak memiliki izin untuk menghapus diskusi ini." };
    }

    await prisma.forumPost.delete({
      where: { id: postId },
    });

    revalidatePath("/forum");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("[FORUM ERROR] deleteForumPostAction failed:", error);
    return { error: "Gagal menghapus diskusi. Terjadi kesalahan pada server." };
  }
}

export async function deleteForumReplyAction(replyId: string): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Anda harus login untuk menghapus balasan." };
  }

  try {
    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return { error: "Balasan tidak ditemukan." };
    }

    if (reply.authorId !== user.id && user.role !== "ADMIN") {
      return { error: "Anda tidak memiliki izin untuk menghapus balasan ini." };
    }

    await prisma.$transaction([
      prisma.forumReply.delete({
        where: { id: replyId },
      }),
      prisma.forumPost.update({
        where: { id: reply.postId },
        data: {
          repliesCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    revalidatePath(`/forum/${reply.postId}`);
    revalidatePath("/forum");
    return { success: true };
  } catch (error: unknown) {
    console.error("[FORUM ERROR] deleteForumReplyAction failed:", error);
    return { error: "Gagal menghapus balasan. Terjadi kesalahan pada server." };
  }
}
