"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct, updateProduct } from "@/app/actions/products";

interface ProductFormModalProps {
  mode: "add" | "edit";
  categories: string[];
  product?: any;
}

export default function ProductFormModal({
  mode,
  categories,
  product,
}: ProductFormModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Local state to dynamically show/hide auction inputs
  const [isAuction, setIsAuction] = useState<boolean>(
    product ? product.isAuction : false
  );
  const [isService, setIsService] = useState<boolean>(
    product ? product.isService : false
  );

  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    product ? product.imageUrl : null
  );
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setObjectUrl(url);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    const input = document.getElementById("image") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    // Explicitly append checkbox values since empty checkboxes are not sent via FormData
    formData.set("isAuction", isAuction ? "true" : "false");
    formData.set("isService", isService ? "true" : "false");

    try {
      let res;
      if (mode === "add") {
        res = await createProduct(formData);
      } else {
        res = await updateProduct(product.id, formData);
      }

      if (res.success) {
        // Redirect to products listing to close modal and refresh list
        router.push("/seller/products");
        router.refresh();
      } else {
        if (res.validationErrors) {
          setValidationErrors(res.validationErrors);
        }
        if (res.error) {
          setError(res.error);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-outline-variant/35 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
          <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
            {mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}
          </h3>
          <Link
            href="/seller/products"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* General Error Banner */}
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm flex items-center gap-2 border border-outline-variant/30 text-left">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Hidden input for edit product ID */}
          {mode === "edit" && (
            <input type="hidden" name="productId" value={product.id} />
          )}

          {/* Nama / Judul Barang */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="title">
              Nama / Judul Barang <span className="text-error">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              type="text"
              defaultValue={product ? product.title : ""}
              placeholder="Contoh: Buku Kalkulus Purcell Jilid 1"
              className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                validationErrors.title ? "border-error" : "border-outline-variant/50"
              }`}
            />
            {validationErrors.title && (
              <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error</span>
                {validationErrors.title[0]}
              </p>
            )}
          </div>

          {/* Toggle Section for Auction and Service */}
          <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <input
                id="isAuction"
                name="isAuction"
                type="checkbox"
                checked={isAuction}
                onChange={(e) => setIsAuction(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <label htmlFor="isAuction" className="text-xs font-semibold text-on-surface cursor-pointer select-none">
                Jadikan Lelang
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isService"
                name="isService"
                type="checkbox"
                checked={isService}
                onChange={(e) => setIsService(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <label htmlFor="isService" className="text-xs font-semibold text-on-surface cursor-pointer select-none">
                Jasa / Tutor
              </label>
            </div>
          </div>

          {/* Pricing Input Fields (Dynamic based on isAuction) */}
          {!isAuction ? (
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="price">
                Harga Barang (Rp) <span className="text-error">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                defaultValue={product ? product.price : ""}
                placeholder="Masukkan nominal angka saja, misal: 75000"
                className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                  validationErrors.price ? "border-error" : "border-outline-variant/50"
                }`}
              />
              {validationErrors.price && (
                <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {validationErrors.price[0]}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 bg-surface-container-low/40 p-3 rounded-lg border border-outline-variant/20">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="startingBid">
                  Harga Mulai Lelang (Rp) <span className="text-error">*</span>
                </label>
                <input
                  id="startingBid"
                  name="startingBid"
                  type="number"
                  defaultValue={product ? product.startingBid : ""}
                  placeholder="Contoh: 50000"
                  className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                    validationErrors.startingBid ? "border-error" : "border-outline-variant/50"
                  }`}
                />
                {validationErrors.startingBid && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {validationErrors.startingBid[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="auctionEnds">
                  Waktu Selesai Lelang <span className="text-error">*</span>
                </label>
                <input
                  id="auctionEnds"
                  name="auctionEnds"
                  type="datetime-local"
                  defaultValue={
                    product && product.auctionEnds
                      ? new Date(product.auctionEnds.getTime() - product.auctionEnds.getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                    validationErrors.auctionEnds ? "border-error" : "border-outline-variant/50"
                  }`}
                />
                {validationErrors.auctionEnds && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {validationErrors.auctionEnds[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="category">
              Kategori <span className="text-error">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={product ? product.category : ""}
              className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer transition-colors ${
                validationErrors.category ? "border-error" : "border-outline-variant/50"
              }`}
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error</span>
                {validationErrors.category[0]}
              </p>
            )}
          </div>

          {/* Rekomendasi Fakultas */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="faculty">
              Rekomendasi Fakultas (Opsional)
            </label>
            <input
              id="faculty"
              name="faculty"
              type="text"
              defaultValue={product && product.faculty ? product.faculty : ""}
              placeholder="Contoh: FEB, FT, Fikes, dll."
              className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Foto Produk Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Foto Produk (Opsional)
            </label>
            
            {/* Mode Selectors */}
            <div className="flex border-b border-outline-variant/30 text-sm font-semibold mb-2">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`flex-1 py-2 text-center border-b-2 transition-colors focus:outline-none cursor-pointer ${
                  imageMode === "upload"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-primary/70"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`flex-1 py-2 text-center border-b-2 transition-colors focus:outline-none cursor-pointer ${
                  imageMode === "url"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-primary/70"
                }`}
              >
                Gunakan URL Gambar
              </button>
            </div>

            {/* Mode Content: Upload File */}
            {imageMode === "upload" ? (
              <div className="space-y-3">
                {previewUrl ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-outline-variant/50 bg-surface-container-low flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer shadow"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById("image")?.click()}
                    className="border-2 border-dashed border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low/30 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-surface"
                  >
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                      cloud_upload
                    </span>
                    <p className="text-xs font-semibold text-on-surface">Klik untuk pilih gambar</p>
                    <p className="text-[10px] text-on-surface-variant/60">JPEG, PNG, WEBP, atau GIF (Maks. 5MB)</p>
                  </div>
                )}
                
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              /* Mode Content: URL Input */
              <div>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="text"
                  defaultValue={product && product.imageUrl && !selectedFile ? product.imageUrl : ""}
                  placeholder="Masukkan link gambar (Unsplash, Imgur, dll.)"
                  className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                    validationErrors.imageUrl ? "border-error" : "border-outline-variant/50"
                  }`}
                />
                {validationErrors.imageUrl && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {validationErrors.imageUrl[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Deskripsi Detail */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="description">
              Deskripsi Detail <span className="text-error">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={product ? product.description : ""}
              placeholder="Jelaskan kondisi barang Anda (ada coretan/tidak, ukuran, kelengkapan, dll.)"
              className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition-colors ${
                validationErrors.description ? "border-error" : "border-outline-variant/50"
              }`}
            ></textarea>
            {validationErrors.description && (
              <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error</span>
                {validationErrors.description[0]}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3 border-t border-outline-variant/30">
            <Link
              href="/seller/products"
              className="flex-1 text-center py-2.5 border border-outline rounded-lg text-on-surface-variant hover:bg-surface-container font-semibold transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 font-bold transition-opacity shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-on-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Iklan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
