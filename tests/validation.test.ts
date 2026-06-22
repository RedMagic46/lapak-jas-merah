import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, productSchema, reviewSchema, itemRequestSchema } from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should pass for valid email and password", () => {
      const result = loginSchema.safeParse({
        identifier: "test@webmail.umm.ac.id",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should pass for valid NIM and password", () => {
      const result = loginSchema.safeParse({
        identifier: "202110370311001",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should fail for empty email/NIM", () => {
      const result = loginSchema.safeParse({
        identifier: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("NIM atau Email wajib diisi");
      }
    });

    it("should fail for short password", () => {
      const result = loginSchema.safeParse({
        identifier: "202110370311001",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password minimal 6 karakter");
      }
    });
  });

  describe("registerSchema", () => {
    it("should pass for valid student details with UMM email", () => {
      const result = registerSchema.safeParse({
        fullName: "Ahmad Dani",
        nim: "202110370311054",
        email: "ahmaddani@webmail.umm.ac.id",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should fail if password and confirmPassword do not match", () => {
      const result = registerSchema.safeParse({
        fullName: "Ahmad Dani",
        nim: "202110370311054",
        email: "ahmaddani@webmail.umm.ac.id",
        password: "password123",
        confirmPassword: "differentpassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Konfirmasi password tidak cocok");
      }
    });

    it("should fail for non-UMM emails", () => {
      const result = registerSchema.safeParse({
        fullName: "Ahmad Dani",
        nim: "202110370311054",
        email: "ahmaddani@gmail.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Harus menggunakan email resmi UMM");
      }
    });

    it("should fail for non-numeric NIM", () => {
      const result = registerSchema.safeParse({
        fullName: "Ahmad Dani",
        nim: "abcde12345",
        email: "ahmaddani@webmail.umm.ac.id",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("NIM hanya boleh berisi angka");
      }
    });
  });

  describe("productSchema", () => {
    it("should pass for valid product details", () => {
      const result = productSchema.safeParse({
        title: "Jas Almamater UMM Ukuran L",
        description: "Jas almamater UMM kondisi sangat baik, jarang dipakai, bersih.",
        price: "150000",
        category: "Jas Almamater",
        faculty: "Teknik",
        imageUrl: "https://example.com/image.jpg",
      });
      expect(result.success).toBe(true);
    });

    it("should parse price as number", () => {
      const result = productSchema.safeParse({
        title: "Jas Almamater UMM Ukuran L",
        description: "Jas almamater UMM kondisi sangat baik, jarang dipakai, bersih.",
        price: "150000",
        category: "Jas Almamater",
        faculty: "Teknik",
        imageUrl: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(150000);
      }
    });

    it("should fail for negative price", () => {
      const result = productSchema.safeParse({
        title: "Jas Almamater UMM",
        description: "Jas almamater UMM kondisi sangat baik.",
        price: "-5000",
        category: "Jas Almamater",
        faculty: "Teknik",
        imageUrl: "",
      });
      expect(result.success).toBe(false);
    });

    it("should fail for empty price with friendly error message", () => {
      const result = productSchema.safeParse({
        title: "Jas Almamater UMM",
        description: "Jas almamater UMM kondisi sangat baik.",
        price: "",
        category: "Jas Almamater",
        faculty: "Teknik",
        imageUrl: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Harga wajib diisi");
      }
    });
  });

  describe("reviewSchema", () => {
    it("should pass for valid rating (1-5) and comment", () => {
      const result = reviewSchema.safeParse({
        rating: "5",
        comment: "Kondisi almamater sangat bersih dan wangi, COD tepat waktu.",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rating).toBe(5);
      }
    });

    it("should fail if rating is less than 1 or greater than 5", () => {
      const lowResult = reviewSchema.safeParse({
        rating: "0",
        comment: "Biasa saja.",
      });
      const highResult = reviewSchema.safeParse({
        rating: "6",
        comment: "Sangat bagus!",
      });
      expect(lowResult.success).toBe(false);
      expect(highResult.success).toBe(false);
    });

    it("should fail if comment is too short or too long", () => {
      const shortResult = reviewSchema.safeParse({
        rating: "4",
        comment: "Oke",
      });
      expect(shortResult.success).toBe(false);
    });
  });

  describe("itemRequestSchema", () => {
    it("should pass for valid WTB/Jastip requests", () => {
      const result = itemRequestSchema.safeParse({
        title: "Mencari Jas Lab Kimia L",
        description: "Butuh cepat jas lab kimia ukuran L untuk praktikum minggu depan.",
        budget: "50000",
        category: "WTB",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.budget).toBe(50000);
        expect(result.data.category).toBe("WTB");
      }
    });

    it("should fail for invalid categories", () => {
      const result = itemRequestSchema.safeParse({
        title: "Jastip Ayam Geprek",
        description: "Tolong belikan ayam geprek depan gerbang kampus.",
        budget: "5000",
        category: "INVALID_CAT",
      });
      expect(result.success).toBe(false);
    });
  });
});
