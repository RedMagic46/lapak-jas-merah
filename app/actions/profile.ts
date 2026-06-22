"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { profileSchema, verificationSchema } from "@/lib/validation";
import { extractValidationErrors } from "@/lib/helpers";
import type { ActionResponse } from "@/lib/types";

export async function updateProfileAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const rawData = {
    name: formData.get("name") as string,
    faculty: formData.get("faculty") as string || null,
    avatarUrl: formData.get("avatarUrl") as string || null,
  };

  const validation = profileSchema.safeParse(rawData);
  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { name, faculty, avatarUrl } = validation.data;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name, faculty, avatarUrl },
    });

    revalidatePath("/seller/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[PROFILE ERROR] updateProfileAction failed:", error);
    return { error: "Gagal memperbarui profil. Terjadi kesalahan pada server." };
  }
}

export async function requestVerificationAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthUser();
  if (!user) return { error: "Akses ditolak: Silakan login terlebih dahulu." };

  const nim = formData.get("nim") as string;
  const ktmUrl = formData.get("ktmUrl") as string;

  const validation = verificationSchema.safeParse({ nim, ktmUrl });
  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  try {
    await prisma.verificationRequest.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        nim,
        ktmUrl,
        status: "PENDING",
      },
      update: {
        nim,
        ktmUrl,
        status: "PENDING",
      },
    });

    revalidatePath("/seller/settings");
    return { success: true };
  } catch (error) {
    console.error("[PROFILE ERROR] requestVerificationAction failed:", error);
    return { error: "Gagal mengajukan verifikasi. Terjadi kesalahan pada server." };
  }
}
