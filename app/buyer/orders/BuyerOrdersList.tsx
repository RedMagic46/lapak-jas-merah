"use client";

import { useState } from "react";
import Link from "next/link";
import { createReviewAction } from "@/app/actions/products";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  status: string;
  meetupLocation: string;
  meetupTime: string | null;
  notes: string | null;
  productId: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    nim: string | null;
  };
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
  };
  hasReviewed: boolean;
  userReview: Review | null;
}

interface Props {
  initialTransactions: Transaction[];
}

export default function BuyerOrdersList({ initialTransactions }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeReviewTxId, setActiveReviewTxId] = useState<string | null>(null);

  // Star selector states (for the open form)
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tabs = [
    { label: "Semua", value: "ALL" },
    { label: "Tertunda", value: "PENDING_ACCEPTED" },
    { label: "Selesai", value: "COMPLETED" },
    { label: "Batal", value: "CANCELLED" },
  ];

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING_ACCEPTED") {
      return tx.status === "PENDING" || tx.status === "ACCEPTED";
    }
    return tx.status === filterStatus;
  });

  const handleReviewToggle = (txId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (activeReviewTxId === txId) {
      setActiveReviewTxId(null);
    } else {
      setActiveReviewTxId(txId);
      setFormRating(5);
      setComment("");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent, tx: Transaction) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (comment.trim().length < 5) {
      setErrorMessage("Komentar minimal 5 karakter.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("rating", formRating.toString());
      formData.append("comment", comment.trim());

      const res = await createReviewAction(tx.productId, formData);

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.validationErrors) {
        // Parse validation errors if any
        const key = Object.keys(res.validationErrors)[0];
        const errorText = res.validationErrors[key]?.[0] || "Validasi gagal.";
        setErrorMessage(errorText);
      } else if (res.success) {
        setSuccessMessage("Ulasan berhasil dikirim!");
        
        // Update local state so review displays immediately
        setTransactions((prevTxs) =>
          prevTxs.map((item) => {
            if (item.id === tx.id) {
              return {
                ...item,
                hasReviewed: true,
                userReview: {
                  id: Math.random().toString(),
                  rating: formRating,
                  comment: comment.trim(),
                  createdAt: new Date().toISOString(),
                },
              };
            }
            return item;
          })
        );

        setTimeout(() => {
          setActiveReviewTxId(null);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <header className="mb-8">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
          Belanjaan Saya
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Pantau status pemesanan barang Anda, detail titik COD Kampus UMM, dan beri ulasan kepuasan Anda.
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/35 mb-8 overflow-x-auto pb-2 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilterStatus(tab.value);
              setActiveReviewTxId(null);
            }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
              filterStatus === tab.value
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        {filteredTransactions.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-16 text-center text-on-surface-variant/65 shadow-sm">
            <span className="material-symbols-outlined text-5xl mb-3 text-on-surface-variant/30">
              receipt_long
            </span>
            <h3 className="font-bold text-lg text-on-surface mb-1">Riwayat Kosong</h3>
            <p className="text-sm">Anda belum memiliki pengajuan belanjaan pada filter status ini.</p>
            <div className="mt-6">
              <Link
                href="/marketplace"
                className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Cari Barang di Pasar
              </Link>
            </div>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/25 shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200"
            >
              {/* Product Info Row */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-surface-container rounded-xl overflow-hidden border border-outline-variant/20 shrink-0">
                    {tx.product.imageUrl ? (
                      <img
                        src={tx.product.imageUrl}
                        alt={tx.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant/45">
                        <span className="material-symbols-outlined text-3xl">image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 uppercase tracking-wider ${
                        tx.status === "PENDING"
                          ? "bg-surface-variant text-on-surface-variant"
                          : tx.status === "ACCEPTED"
                          ? "bg-secondary-container text-on-secondary-container"
                          : tx.status === "COMPLETED"
                          ? "bg-tertiary-fixed text-on-tertiary-fixed"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {tx.status === "PENDING" ? "Menunggu Persetujuan" : tx.status === "ACCEPTED" ? "COD Disetujui" : tx.status === "COMPLETED" ? "Selesai" : "Dibatalkan"}
                    </span>
                    <h3 className="font-title-lg text-body-lg font-bold text-on-surface leading-tight hover:text-primary transition-colors">
                      <Link href={`/marketplace/${tx.productId}`}>{tx.product.title}</Link>
                    </h3>
                    <p className="text-primary font-bold text-md mt-1">
                      Rp {tx.product.price.toLocaleString("id-ID")}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-on-surface-variant leading-relaxed">
                      <p>
                        <span className="font-semibold text-on-surface">Penjual:</span> {tx.seller.name} (NIM: {tx.seller.nim || "-"})
                      </p>
                      <p>
                        <span className="font-semibold text-on-surface">Lokasi COD:</span> {tx.meetupLocation}
                      </p>
                      <p>
                        <span className="font-semibold text-on-surface">Waktu Pertemuan:</span>{" "}
                        {tx.meetupTime ? new Date(tx.meetupTime).toLocaleString("id-ID") : "Nego di chat"}
                      </p>
                      {tx.notes && (
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-on-surface">Catatan Pembeli:</span> &quot;{tx.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex gap-2.5 md:flex-col shrink-0 w-full md:w-auto">
                  {tx.status === "COMPLETED" && (
                    <button
                      onClick={() => handleReviewToggle(tx.id)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        tx.hasReviewed
                          ? "bg-tertiary/10 text-tertiary border border-tertiary/20 hover:bg-tertiary/20"
                          : activeReviewTxId === tx.id
                          ? "bg-outline/25 text-on-surface border border-outline-variant"
                          : "bg-primary text-on-primary hover:opacity-95 shadow-sm"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">rate_review</span>
                      <span>{tx.hasReviewed ? "Lihat Ulasan" : activeReviewTxId === tx.id ? "Tutup Form" : "Beri Ulasan"}</span>
                    </button>
                  )}

                  <Link
                    href={`/chat?partnerId=${tx.seller.id}&productId=${tx.productId}`}
                    className="flex-1 md:flex-initial px-4 py-2.5 border border-secondary text-secondary hover:bg-secondary/5 rounded-lg text-xs font-bold transition-colors text-center flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">chat</span>
                    <span>Hubungi Penjual</span>
                  </Link>
                </div>
              </div>

              {/* Expandable Review Section */}
              {activeReviewTxId === tx.id && (
                <div className="border-t border-outline-variant/30 bg-surface-container-low/20 p-6 transition-all duration-300">
                  {tx.hasReviewed && tx.userReview ? (
                    // Displaying existing review
                    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-5 shadow-inner">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-lg"
                              style={{ fontVariationSettings: i < (tx.userReview?.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                          <span className="text-xs font-semibold ml-1 text-on-surface-variant">
                            ({tx.userReview.rating} dari 5 Bintang)
                          </span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant/60 font-semibold">
                          {new Date(tx.userReview.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed italic">
                        &quot;{tx.userReview.comment}&quot;
                      </p>
                    </div>
                  ) : (
                    // Form to write a review
                    <form onSubmit={(e) => handleReviewSubmit(e, tx)} className="space-y-4 max-w-xl">
                      <h4 className="font-title-lg text-body-lg font-bold text-on-surface">
                        Beri Nilai untuk Barang / Jasa Ini
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        Berikan ulasan jujur Anda setelah bertransaksi secara langsung untuk membantu komunitas mahasiswa UMM lainnya.
                      </p>

                      {/* Interactive Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="focus:outline-none transition-transform active:scale-95 p-1 cursor-pointer"
                            title={`${star} Bintang`}
                          >
                            <span
                              className="material-symbols-outlined text-3xl transition-colors duration-150"
                              style={{
                                fontVariationSettings: star <= (hoverRating ?? formRating) ? "'FILL' 1" : "'FILL' 0",
                                color: star <= (hoverRating ?? formRating) ? "#ffb400" : "#8f706c",
                              }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                        <span className="text-xs font-bold text-on-surface ml-2">
                          {formRating === 5
                            ? "Sangat Puas ⭐⭐⭐⭐⭐"
                            : formRating === 4
                            ? "Puas ⭐⭐⭐⭐"
                            : formRating === 3
                            ? "Biasa Saja ⭐⭐⭐"
                            : formRating === 2
                            ? "Kurang ⭐⭐"
                            : "Sangat Kecewa ⭐"}
                        </span>
                      </div>

                      {/* Comment Input */}
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor={`comment-${tx.id}`}>
                          Ulasan / Komentar <span className="text-[10px] text-on-surface-variant/75">(Minimal 5 karakter)</span>
                        </label>
                        <textarea
                          id={`comment-${tx.id}`}
                          required
                          rows={3}
                          placeholder="Jelaskan kualitas barang atau kelancaran proses pertemuan COD Anda..."
                          className="w-full bg-surface-container-lowest text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm resize-none transition-shadow"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Status Alerts */}
                      {errorMessage && (
                        <div className="p-3.5 bg-error-container text-on-error-container rounded-lg text-xs font-semibold flex items-center gap-2 border border-outline-variant/20 animate-shake">
                          <span className="material-symbols-outlined text-lg">error</span>
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {successMessage && (
                        <div className="p-3.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-green-200">
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          <span>{successMessage}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
