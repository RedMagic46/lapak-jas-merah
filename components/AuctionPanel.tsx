"use client";

import React, { useState, useEffect } from "react";
import { placeBidAction } from "@/app/actions/products";

interface Bid {
  id: string;
  amount: number;
  createdAt: Date;
  bidder: {
    name: string;
  };
}

interface AuctionPanelProps {
  productId: string;
  startingBid: number;
  currentBid: number;
  auctionEnds: Date | null;
  bids: Bid[];
  currentUser: { id: string } | null;
  sellerId: string;
}

export default function AuctionPanel({
  productId,
  startingBid,
  currentBid,
  auctionEnds,
  bids,
  currentUser,
  sellerId,
}: AuctionPanelProps) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("Loading...");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!auctionEnds) {
      setTimeLeft("Tidak ada batasan waktu");
      return;
    }

    const endTime = new Date(auctionEnds).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft("Lelang Telah Berakhir");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let timerString = "";
      if (days > 0) timerString += `${days}h `;
      if (hours > 0 || days > 0) timerString += `${hours}j `;
      timerString += `${minutes}m ${seconds}d`;

      setTimeLeft(timerString);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auctionEnds]);

  const activeBid = currentBid > 0 ? currentBid : startingBid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentUser) {
      setError("Silakan login terlebih dahulu untuk mengajukan penawaran.");
      return;
    }

    if (currentUser.id === sellerId) {
      setError("Anda tidak dapat mengajukan penawaran untuk produk Anda sendiri.");
      return;
    }

    const bidVal = parseFloat(amount);
    if (isNaN(bidVal) || bidVal <= 0) {
      setError("Masukkan jumlah penawaran yang valid.");
      return;
    }

    if (bidVal <= activeBid) {
      setError(`Penawaran harus lebih besar dari Rp ${activeBid.toLocaleString("id-ID")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await placeBidAction(productId, bidVal);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setAmount("");

        window.location.reload();
      }
    } catch (err) {
      console.error("[BID ERROR] placeBidAction catch:", err);
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-amber-200/50">
        <div>
          <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-[12px] animate-pulse">timer</span>
            Flash Auction / Lelang
          </span>
          <h3 className="font-title-lg text-title-lg font-bold text-amber-950 mt-1.5">
            Papan Penawaran Lelang
          </h3>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Sisa Waktu</p>
          <p className={`font-headline-md font-bold ${isExpired ? "text-red-600" : "text-amber-900"}`}>
            {timeLeft}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-inner">
            <p className="text-xs text-on-surface-variant font-medium">
              {currentBid > 0 ? "Penawaran Tertinggi Saat Ini" : "Harga Awal Lelang"}
            </p>
            <p className="font-display-lg text-2xl font-bold text-amber-700 mt-1">
              Rp {activeBid.toLocaleString("id-ID")}
            </p>
          </div>

          {!isExpired && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1.5" htmlFor="bidAmount">
                  Masukkan Penawaran Anda
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    id="bidAmount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${(activeBid + 5000).toLocaleString("id-ID")}`}
                    className="w-full bg-white border border-amber-300 rounded-xl pl-9 pr-4 py-3 outline-none font-semibold text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    disabled={loading || isExpired}
                  />
                </div>
                <p className="text-[10px] text-amber-800/80 mt-1">
                  * Harus lebih tinggi dari Rp {activeBid.toLocaleString("id-ID")}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-xs px-3 py-2.5 rounded-lg border border-red-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 text-xs px-3 py-2.5 rounded-lg border border-green-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Penawaran Anda berhasil diajukan!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isExpired}
                className="w-full bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">gavel</span>
                    Ajukan Bid
                  </>
                )}
              </button>
            </form>
          )}

          {isExpired && (
            <div className="bg-gray-100 text-gray-700 text-sm font-semibold p-4 rounded-xl text-center border border-gray-200">
              Lelang telah ditutup. Tidak dapat menerima penawaran baru.
            </div>
          )}
        </div>

        <div className="bg-white border border-amber-200/50 rounded-xl p-4 shadow-sm h-full max-h-[260px] flex flex-col">
          <h4 className="font-title-md text-xs font-bold text-amber-950 uppercase tracking-wider mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">history</span>
            Riwayat Penawaran ({bids.length})
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {bids.length === 0 ? (
              <p className="text-xs text-on-surface-variant/70 italic text-center py-8">
                Belum ada penawaran. Jadilah yang pertama!
              </p>
            ) : (
              bids.map((bid, idx) => (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs border ${
                    idx === 0
                      ? "bg-amber-50 border-amber-200/80 font-bold text-amber-900"
                      : "bg-gray-50/50 border-gray-100 text-on-surface-variant"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-sm shrink-0">
                      {idx === 0 ? "stars" : "person"}
                    </span>
                    <span className="truncate">{bid.bidder.name}</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span>Rp {bid.amount.toLocaleString("id-ID")}</span>
                    {idx === 0 && (
                      <span className="bg-amber-200 text-amber-800 text-[8px] px-1 py-0.5 rounded font-bold uppercase shrink-0">
                        Tertinggi
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
