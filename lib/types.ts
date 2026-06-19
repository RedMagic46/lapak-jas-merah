import type { User } from "@prisma/client";

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export type ProductStatus = "ACTIVE" | "SOLD" | "ARCHIVED" | "FLAGGED";

export type TransactionType = "SALE" | "BARTER" | "DONATION";

export type TransactionStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";

export type PaymentMethod = "COD_CASH" | "ESCROW_QRIS" | "ESCROW_TRANSFER";

export type PaymentStatus = "UNPAID" | "PAID" | "VERIFIED" | "RELEASED" | "REFUNDED";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export type ItemRequestCategory = "WTB" | "JASTIP";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ActionResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
  validationErrors?: Record<string, string[]>;
}

export interface Partner {
  partnerId: string;
  name: string;
  avatarUrl: string | null;
  lastMessage: string;
  time: Date;
  isRead: boolean;
  productId: string | null;
  productTitle: string;
  productPrice: number;
  productImage: string;
  type: "BUYING" | "SELLING";
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  productId: string | null;
  createdAt: Date;
}

export type SafeUser = Omit<User, "password">;
