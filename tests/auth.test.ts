import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "@/lib/auth";
import type { SessionPayload } from "@/lib/types";

describe("Auth Utilities", () => {
  const mockPayload: SessionPayload = {
    userId: "user_12345",
    email: "test@webmail.umm.ac.id",
    role: "BUYER",
  };

  it("should successfully sign and verify a token", () => {
    const token = signToken(mockPayload);
    expect(token).toBeTypeOf("string");
    expect(token.split(".").length).toBe(3); 

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    if (verified) {
      expect(verified.userId).toBe(mockPayload.userId);
      expect(verified.email).toBe(mockPayload.email);
      expect(verified.role).toBe(mockPayload.role);
    }
  });

  it("should return null for an invalid token", () => {
    const invalidToken = "invalid.token.here";
    const verified = verifyToken(invalidToken);
    expect(verified).toBeNull();
  });

  it("should return null for an expired or tampered token", () => {
    const token = signToken(mockPayload);
    
    const tamperedToken = token + "abc";
    const verified = verifyToken(tamperedToken);
    expect(verified).toBeNull();
  });
});
