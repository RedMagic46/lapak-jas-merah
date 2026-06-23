import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { SessionPayload } from "@/lib/types";
import { COOKIE_NAME } from "@/lib/helpers";

async function verifyEdgeToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const encodedSecret = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const payload = token ? await verifyEdgeToken(token) : null;

  const isSellerPath = pathname.startsWith("/seller");
  const isBuyerPath = pathname.startsWith("/buyer");
  const isAdminPath = pathname.startsWith("/admin");
  const isChatPath = pathname.startsWith("/chat");
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isTransactionPath =
    pathname.startsWith("/marketplace/") && pathname.endsWith("/transaksi");

  const getLoginRedirect = () => {
    const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  };

  if (isAdminPath) {
    if (!payload) {
      return getLoginRedirect();
    }
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/marketplace", request.url));
    }
  }

  if (isSellerPath) {
    if (!payload) {
      return getLoginRedirect();
    }
  }

  if (isBuyerPath) {
    if (!payload) {
      return getLoginRedirect();
    }
  }

  if (isChatPath || isTransactionPath) {
    if (!payload) {
      return getLoginRedirect();
    }
  }

  if (isAuthPage && payload) {
    if (payload.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (payload.role === "SELLER") {
      return NextResponse.redirect(new URL("/seller", request.url));
    }
    return NextResponse.redirect(new URL("/marketplace", request.url));
  }

  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/marketplace/:path*",
    "/chat/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/buyer/:path*",
    "/login",
    "/register",
  ],
};
