"use client";

import React, { useState } from "react";
import { reportListingAction, blockUserAction, unblockUserAction } from "@/app/actions/moderation";

interface ModerationButtonsProps {
  productId: string;
  sellerId: string;
  sellerName: string;
  isBlocked: boolean;
  currentUser: { id: string } | null;
}

export default function ModerationButtons({
  productId,
  sellerId,
  sellerName,
  isBlocked,
  currentUser,
}: ModerationButtonsProps) {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentUser) return null;
  if (currentUser.id === sellerId) return null;

  const predefinedReasons = [
    "Barang Terlarang / Melanggar Aturan Kampus",
    "Penipuan / Deskripsi Palsu",
    "Harga Tidak Wajar / Spam",
    "Kategori Tidak Sesuai",
  ];

  const handleBlockToggle = async () => {
    const actionText = isBlocked ? "membuka blokir" : "memblokir";
    const confirmMsg = isBlocked
      ? `Apakah Anda yakin ingin membuka blokir ${sellerName}? Anda akan dapat kembali saling mengirim pesan.`
      : `Apakah Anda yakin ingin memblokir ${sellerName}? Anda tidak akan menerima chat masuk dari pengguna ini.`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = isBlocked
        ? await unblockUserAction(sellerId)
        : await blockUserAction(sellerId);

      if (res.error) {
        alert(res.error);
      } else {
        alert(`Berhasil ${actionText} ${sellerName}.`);
        window.location.reload();
      }
    } catch (err) {
      console.error("[BLOCK ERROR] handleBlockToggle catch:", err);
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const finalReason = reportReason === "Lainnya" ? customReason : reportReason;
    if (!finalReason.trim()) {
      setError("Harap pilih atau tuliskan alasan laporan.");
      return;
    }

    setLoading(true);
    try {
      const res = await reportListingAction(productId, finalReason);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg("Laporan Anda berhasil dikirim ke Admin. Terima kasih atas kontribusi Anda menjaga keamanan Lapak Jas Merah.");
        setReportReason("");
        setCustomReason("");
        setTimeout(() => {
          setShowReportModal(false);
          setSuccessMsg(null);
        }, 3000);
      }
    } catch (err) {
      console.error("[REPORT ERROR] handleReportSubmit catch:", err);
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/20">
      <button
        onClick={() => setShowReportModal(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-error transition-colors cursor-pointer"
        title="Laporkan iklan barang ini"
      >
        <span className="material-symbols-outlined text-[16px]">report</span>
        Laporkan Barang
      </button>

      <span className="text-outline-variant/40">|</span>

      <button
        onClick={handleBlockToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
          isBlocked
            ? "text-primary hover:text-primary-container"
            : "text-on-surface-variant hover:text-error"
        }`}
        title={isBlocked ? "Buka blokir komunikasi" : "Blokir komunikasi dengan penjual"}
      >
        <span className="material-symbols-outlined text-[16px]">
          {isBlocked ? "lock_open" : "block"}
        </span>
        {isBlocked ? `Buka Blokir ${sellerName}` : `Blokir ${sellerName}`}
      </button>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-xl border border-outline-variant/35 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
              <h3 className="font-title-lg text-body-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">report</span>
                Laporkan Iklan Produk
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-5 space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Keamanan dan kenyamanan transaksi mahasiswa adalah prioritas kami. Laporkan produk jika melanggar ketentuan Lapak Jas Merah.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface">Pilih Alasan Laporan</label>
                {predefinedReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-outline-variant/30 bg-surface hover:bg-surface-container-low cursor-pointer text-xs text-on-surface-variant"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="accent-primary"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-outline-variant/30 bg-surface hover:bg-surface-container-low cursor-pointer text-xs text-on-surface-variant">
                  <input
                    type="radio"
                    name="reportReason"
                    value="Lainnya"
                    checked={reportReason === "Lainnya"}
                    onChange={() => setReportReason("Lainnya")}
                    className="accent-primary"
                  />
                  <span>Alasan Lainnya...</span>
                </label>
              </div>

              {reportReason === "Lainnya" && (
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1" htmlFor="customReason">
                    Tuliskan Alasan Detail
                  </label>
                  <textarea
                    id="customReason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Tulis alasan laporan Anda disini..."
                    rows={3}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 outline-none font-body-md text-xs text-on-surface focus:border-primary resize-none"
                  ></textarea>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded border border-red-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded border border-green-200 flex items-center gap-1.5 leading-relaxed">
                  <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="pt-3 flex gap-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 text-center py-2 border border-outline rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-error text-white rounded-lg hover:bg-error-container font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
