import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { SessionPayload, SafeUser } from "./types";
import { COOKIE_NAME, JWT_EXPIRY_DAYS } from "./helpers";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Application cannot start securely."
    );
  }
  return secret;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: `${JWT_EXPIRY_DAYS}d` });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      omit: { password: true },
      include: {
        verificationRequest: true,
      },
    });
    if (!user || !user.isEmailVerified) return null;
    return user;
  } catch {
    return null;
  }
}

export async function loginSession(user: {
  id: string;
  email: string;
  role: string;
}) {
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role as SessionPayload["role"],
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * JWT_EXPIRY_DAYS,
  });
}

export async function logoutSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
