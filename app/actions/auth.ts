"use server";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginSession, logoutSession } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimiter";
import { extractValidationErrors, BCRYPT_SALT_ROUNDS } from "@/lib/helpers";
import { sendVerificationEmail } from "@/lib/email";
import type { ActionResponse, UserRole } from "@/lib/types";

export async function loginAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rateLimit = await checkRateLimit("login", 5, 60 * 1000);
  if (!rateLimit.success) {
    return {
      error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.",
    };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "";
  const safeCallbackUrl = callbackUrl.startsWith("/") ? callbackUrl : "";

  const validation = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { identifier, password } = validation.data;
  let userRole: UserRole = "BUYER";

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { nim: identifier }],
      },
    });

    if (!user) {
      return {
        error: "Akun tidak ditemukan. Silakan periksa kembali NIM/Email Anda.",
      };
    }

    if (!user.isEmailVerified) {
      return {
        error: "Email Anda belum terverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
        data: {
          isUnverified: true,
          email: user.email,
        },
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: "Password salah. Silakan coba lagi." };
    }

    userRole = user.role as UserRole;

    await loginSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error: unknown) {
    console.error("[AUTH ERROR] loginAction failed:", error);
    return {
      error: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
    };
  }

  if (safeCallbackUrl) {
    redirect(safeCallbackUrl);
  } else {
    if (userRole === "ADMIN") {
      redirect("/admin");
    } else if (userRole === "SELLER") {
      redirect("/seller");
    } else {
      redirect("/marketplace");
    }
  }
}

export async function registerAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rateLimit = await checkRateLimit("register", 3, 60 * 1000);
  if (!rateLimit.success) {
    return {
      error:
        "Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.",
    };
  }

  const validation = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    nim: formData.get("nim"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validation.success) {
    return { validationErrors: extractValidationErrors(validation) };
  }

  const { fullName, nim, email, password } = validation.data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { nim }],
      },
    });

    if (existingUser) {
      return { error: "Email atau NIM sudah terdaftar." };
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email,
        nim,
        name: fullName,
        password: passwordHash,
        role: "BUYER",
        isVerified: false,
        isEmailVerified: false,
      },
    });

    
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await prisma.emailVerificationToken.create({
      data: {
        userId: newUser.id,
        tokenHash,
        expiresAt,
      },
    });

    
    await sendVerificationEmail({
      email: newUser.email,
      name: newUser.name,
      token,
      expiresInHours: 24,
    });
  } catch (error: unknown) {
    console.error("[AUTH ERROR] registerAction failed:", error);
    return {
      error:
        "Pendaftaran gagal karena terjadi kesalahan sistem. Silakan coba lagi nanti.",
    };
  }

  redirect(`/verify-email/pending?email=${encodeURIComponent(email)}`);
}

export async function resendVerificationAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get("email") as string;
  if (!email || (!email.endsWith("@webmail.umm.ac.id") && !email.endsWith("@umm.ac.id"))) {
    return { error: "Alamat email tidak valid." };
  }

  // Rate limit resend attempts (max 3 times per minute)
  const rateLimit = await checkRateLimit("resend-verification", 3, 60 * 1000);
  if (!rateLimit.success) {
    return {
      error: "Terlalu banyak permintaan kirim ulang. Silakan coba lagi dalam 1 menit.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Pengguna tidak ditemukan." };
    }

    if (user.isEmailVerified) {
      return { error: "Email Anda sudah terverifikasi. Silakan login." };
    }

    // Delete any existing token for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
      expiresInHours: 24,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("[AUTH ERROR] resendVerificationAction failed:", error);
    return {
      error: "Gagal mengirim ulang email verifikasi. Silakan coba lagi nanti.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  await logoutSession();
  redirect("/login");
}
