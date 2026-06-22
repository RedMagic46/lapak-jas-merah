"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { sendMessage } from "@/app/actions/messages";
import { updateTransactionStatus, uploadPaymentProof } from "@/app/actions/transactions";
import { unblockUserAction } from "@/app/actions/moderation";
import type { Partner, ChatMessage } from "@/lib/types";

type Message = ChatMessage;

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant font-semibold">
      Memuat Peta...
    </div>
  )
});

interface ChatWindowProps {
  currentUser: { id: string; name: string; avatarUrl: string | null };
  inboxPartners: Partner[];
  selectedPartnerId: string | null;
  messages: Message[];
  activeProduct: { id: string; title: string; price: number; imageUrl: string | null } | null;
  activeTransaction?: {
    id: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    paymentProofUrl: string | null;
    meetupLocation: string;
    meetupTime: Date | null;
  } | null;
  isBlockedByMe?: boolean;
  isBlockingMe?: boolean;
}

export default function ChatWindow({
  currentUser,
  inboxPartners,
  selectedPartnerId,
  messages,
  activeProduct,
  activeTransaction,
  isBlockedByMe = false,
  isBlockingMe = false,
}: ChatWindowProps) {
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [inputVal, setInputVal] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [showMap, setShowMap] = useState(false);

  const handleUpdateStatus = async (txId: string, status: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status COD menjadi ${status}?`)) return;
    const res = await updateTransactionStatus(txId, status);
    if (res.error) {
      alert("Gagal memperbarui status: " + res.error);
    } else {
      window.location.reload();
    }
  };

  const handleProofUpload = async (txId: string, proofUrl: string) => {
    if (!proofUrl.startsWith("http")) {
      alert("Harap berikan tautan URL bukti pembayaran yang valid!");
      return;
    }
    const res = await uploadPaymentProof(txId, proofUrl);
    if (res.error) {
      alert("Gagal mengupload bukti pembayaran: " + res.error);
    } else {
      alert("Bukti pembayaran berhasil diupload! Menunggu konfirmasi admin.");
      window.location.reload();
    }
  };

  const handleUnblock = async () => {
    if (!selectedPartnerId) return;
    if (!confirm("Apakah Anda yakin ingin membuka blokir pengguna ini?")) return;
    const res = await unblockUserAction(selectedPartnerId);
    if (res.error) {
      alert("Gagal membuka blokir: " + res.error);
    } else {
      alert("Blokir berhasil dibuka.");
      window.location.reload();
    }
  };

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (!selectedPartnerId) return;

    const eventSource = new EventSource(`/api/chat/sse?partnerId=${selectedPartnerId}`);

    eventSource.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data);
        setLocalMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [
            ...prev,
            {
              ...newMsg,
              createdAt: new Date(newMsg.createdAt),
            },
          ];
        });
      } catch (err) {
        console.error("[SSE] Failed to parse message:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [selectedPartnerId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    setShowMap(false);
  }, [selectedPartnerId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || !inputVal.trim()) return;

    const text = inputVal;
    setInputVal("");

    const tempMsg: Message = {
      id: Math.random().toString(),
      senderId: currentUser.id,
      receiverId: selectedPartnerId,
      content: text,
      productId: activeProduct?.id || null,
      createdAt: new Date(),
    };

    setLocalMessages((prev) => [...prev, tempMsg]);

    const res = await sendMessage(selectedPartnerId, text, activeProduct?.id);
    if (res.error) {
      alert("Gagal mengirim pesan: " + res.error);

      setLocalMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } else if (res.success && res.data) {

      setLocalMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? (res.data as Message) : m))
      );
    }
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row h-full md:pt-16 pb-[72px] md:pb-0 overflow-hidden relative z-0">
      <div className="w-full md:w-96 flex flex-col border-r border-outline-variant/30 bg-surface-lowest h-full z-10 shrink-0">
        <div className="p-4 border-b border-outline-variant/30 bg-white sticky top-0 z-20">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-body-md text-on-background placeholder-on-surface-variant/60 shadow-inner"
              placeholder="Cari pesan..."
              type="text"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {inboxPartners.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant/60 font-body-md text-sm">
              Belum ada percakapan aktif.
            </div>
          ) : (
            inboxPartners.map((p) => {
              const isActive = selectedPartnerId === p.partnerId;
              return (
                <Link
                  key={p.partnerId}
                  href={`/chat?partnerId=${p.partnerId}${p.productId ? `&productId=${p.productId}` : ""}`}
                  className={`block p-4 border-b border-surface-container hover:bg-surface-container-low transition-colors relative cursor-pointer ${
                    isActive ? "bg-surface-container/60" : "bg-white"
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover border border-outline-variant/30 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-lowest rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-title-lg text-body-lg font-bold text-on-background truncate">
                          {p.name}
                        </h3>
                        <span className="text-[10px] text-on-surface-variant shrink-0">
                          {new Date(p.time).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide ${
                            p.type === "SELLING"
                              ? "bg-surface-variant text-on-surface-variant"
                              : "bg-primary-container text-on-primary-container"
                          }`}
                        >
                          {p.type}
                        </span>
                        <span className="text-xs text-on-surface-variant truncate font-semibold">
                          {p.productTitle}
                        </span>
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant truncate">
                        {p.lastMessage}
                      </p>
                    </div>

                    {!p.isRead && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 shrink-0"></div>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-surface-bright relative z-0">
        {selectedPartnerId ? (
          <>
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-outline-variant/30 z-20 shrink-0">
              <div className="flex items-center gap-4">
                <Link href="/chat" className="md:hidden text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </Link>
                <div className="relative shrink-0">
                  {inboxPartners.find((p) => p.partnerId === selectedPartnerId)?.avatarUrl ? (
                    <img
                      src={inboxPartners.find((p) => p.partnerId === selectedPartnerId)?.avatarUrl || ""}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                      {inboxPartners.find((p) => p.partnerId === selectedPartnerId)?.name.charAt(0) || "P"}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-surface-lowest rounded-full"></div>
                </div>
                <div>
                  <h2 className="font-title-lg text-body-lg font-bold text-on-background leading-tight">
                    {inboxPartners.find((p) => p.partnerId === selectedPartnerId)?.name}
                  </h2>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                    Online
                  </p>
                </div>
              </div>

              {activeProduct && (
                <div className="hidden lg:flex items-center gap-3 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/45 shadow-sm max-w-xs shrink-0">
                  <img
                    src={activeProduct.imageUrl || ""}
                    alt="Context Product"
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-body-md text-xs font-semibold text-on-background truncate">
                      {activeProduct.title}
                    </p>
                    <p className="font-headline-md text-primary text-xs font-bold mt-0.5">
                      Rp {activeProduct.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Link
                    href={`/marketplace/${activeProduct.id}/transaksi`}
                    className="bg-primary text-on-primary text-[10px] px-2 py-1.5 rounded-lg hover:opacity-90 font-bold tracking-wide uppercase shrink-0"
                  >
                    COD
                  </Link>
                </div>
              )}
            </div>

            {activeTransaction && (
              <>
                <div className="bg-surface-container border-b border-outline-variant/30 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm z-10 shrink-0">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
                      handshake
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface">
                        Status COD: {activeTransaction.status} ({activeTransaction.paymentMethod === "COD_CASH" ? "Bayar Tunai" : "Rekber Escrow"})
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Lokasi: <span className="font-semibold">{activeTransaction.meetupLocation.split(" (")[0]}</span></span>
                        {activeTransaction.meetupTime && <span>| Waktu: <span className="font-semibold">{new Date(activeTransaction.meetupTime).toLocaleString("id-ID")}</span></span>}
                        {activeTransaction.meetupLocation !== "Pertemuan Online via Zoom/Google Meet/Discord" && (
                          <button
                            type="button"
                            onClick={() => setShowMap(!showMap)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-container bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded transition-all cursor-pointer select-none"
                          >
                            <span className="material-symbols-outlined text-[14px]">map</span>
                            {showMap ? "Sembunyikan Peta" : "Lihat Peta"}
                          </button>
                        )}
                      </p>

                      {activeTransaction.paymentMethod !== "COD_CASH" && (
                        <p className="text-xs font-semibold text-primary mt-1">
                          Status Pembayaran: {
                            activeTransaction.paymentStatus === "UNPAID" ? "Belum Dibayar" :
                            activeTransaction.paymentStatus === "PAID" ? "Sudah Dibayar (Menunggu Verifikasi Admin)" :
                            activeTransaction.paymentStatus === "VERIFIED" ? "Terverifikasi (Dana ditahan Sistem)" :
                            activeTransaction.paymentStatus === "RELEASED" ? "Selesai (Dana dicairkan ke Penjual)" : "Dibatalkan/Refunded"
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center shrink-0">
                  {activeTransaction.sellerId === currentUser.id && (
                    <>
                      {activeTransaction.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(activeTransaction.id, "ACCEPTED")}
                            className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer"
                          >
                            Terima COD
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(activeTransaction.id, "CANCELLED")}
                            className="bg-error/10 text-error hover:bg-error/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      {activeTransaction.status === "ACCEPTED" && (
                        <>
                          {(activeTransaction.paymentMethod === "COD_CASH" || activeTransaction.paymentStatus === "VERIFIED") ? (
                            <button
                              onClick={() => handleUpdateStatus(activeTransaction.id, "COMPLETED")}
                              className="bg-tertiary text-on-tertiary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                            >
                              Selesaikan COD
                            </button>
                          ) : (
                            <span className="text-xs text-on-surface-variant italic mr-2">Menunggu pembeli melakukan pembayaran</span>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(activeTransaction.id, "CANCELLED")}
                            className="bg-error/10 text-error hover:bg-error/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Batalkan
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {activeTransaction.buyerId === currentUser.id && (
                    <>
                      {activeTransaction.status === "PENDING" && (
                        <span className="text-xs text-on-surface-variant italic">Menunggu respon penjual...</span>
                      )}
                      {activeTransaction.status === "ACCEPTED" && (
                        <>
                          {activeTransaction.paymentMethod !== "COD_CASH" && activeTransaction.paymentStatus === "UNPAID" && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 rounded-xl border border-outline-variant/35 shadow-sm">
                              <div className="text-xs shrink-0 max-w-[200px]">
                                <span className="font-bold">Transfer ke Rekber:</span> Mandiri 123-456-789 a.n. LJM Escrow.
                              </div>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const url = (e.currentTarget.elements.namedItem("proofUrl") as HTMLInputElement).value;
                                  handleProofUpload(activeTransaction.id, url);
                                }}
                                className="flex gap-1"
                              >
                                <input
                                  type="url"
                                  name="proofUrl"
                                  placeholder="Link Bukti Transfer"
                                  required
                                  className="px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded text-xs focus:outline-none w-32"
                                />
                                <button type="submit" className="bg-primary text-on-primary px-2.5 py-1 rounded text-xs font-bold hover:opacity-90 cursor-pointer">
                                  Kirim
                                </button>
                              </form>
                            </div>
                          )}
                          {activeTransaction.paymentMethod !== "COD_CASH" && activeTransaction.paymentStatus === "PAID" && (
                            <span className="text-xs text-on-surface-variant italic mr-2">Menunggu verifikasi admin...</span>
                          )}
                          {activeTransaction.paymentMethod !== "COD_CASH" && activeTransaction.paymentStatus === "VERIFIED" && (
                            <span className="text-xs text-tertiary font-semibold mr-2">Siap COD. Info penjual untuk klik Selesai saat bertemu.</span>
                          )}
                          {activeTransaction.paymentMethod === "COD_CASH" && (
                            <span className="text-xs text-primary font-semibold mr-2">Bertemu penjual & bayar tunai. Info penjual untuk klik Selesai.</span>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(activeTransaction.id, "CANCELLED")}
                            className="bg-error/10 text-error hover:bg-error/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Batalkan
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {activeTransaction.status === "COMPLETED" && (
                    <span className="bg-tertiary/10 text-tertiary text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      COD SELESAI
                    </span>
                  )}
                  {activeTransaction.status === "CANCELLED" && (
                    <span className="bg-error/10 text-error text-xs font-bold px-2.5 py-1 rounded-full">
                      COD DIBATALKAN
                    </span>
                  )}
                </div>
              </div>
              {showMap && activeTransaction.meetupLocation !== "Pertemuan Online via Zoom/Google Meet/Discord" && (
                <div className="h-[250px] w-full border-b border-outline-variant/30 relative z-10">
                  <LeafletMap
                    mode="readonly"
                    locationString={activeTransaction.meetupLocation}
                  />
                </div>
              )}
            </>
          )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-surface-bright/50">
              {localMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const isSystem = msg.content.startsWith("[SISTEM]");

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-4">
                      <div className="bg-secondary-fixed/50 border border-secondary-fixed-dim text-on-secondary-fixed-variant text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 max-w-md text-center leading-relaxed">
                        <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                        <span>{msg.content.replace("[SISTEM]", "").trim()}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-xs shrink-0 mb-1">
                        {inboxPartners.find((p) => p.partnerId === selectedPartnerId)?.name.charAt(0) || "P"}
                      </div>
                    )}
                    <div className={`flex flex-col gap-1 max-w-[75%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`p-3 rounded-2xl shadow-sm border text-sm leading-relaxed ${
                          isMe
                            ? "bg-primary text-on-primary rounded-br-sm border-transparent"
                            : "bg-white text-on-background rounded-bl-sm border-outline-variant/30"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-on-surface-variant/75 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-outline-variant/30 shrink-0">
              {isBlockedByMe ? (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">block</span>
                    <span>Anda memblokir pengguna ini. Buka blokir untuk mulai percakapan.</span>
                  </div>
                  <button
                    onClick={handleUnblock}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-lg transition-colors shadow-sm shrink-0"
                  >
                    Buka Blokir
                  </button>
                </div>
              ) : isBlockingMe ? (
                <div className="bg-gray-100 border border-gray-200 text-gray-700 rounded-xl p-4 flex items-center gap-2 text-xs font-semibold">
                  <span className="material-symbols-outlined text-gray-500">block</span>
                  <span>Anda tidak dapat mengirim pesan ke pengguna ini.</span>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-end gap-2 bg-surface-container-low rounded-xl border border-outline-variant/40 p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-inner">
                  <button
                    type="button"
                    className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-lg transition-colors shrink-0 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">attach_file</span>
                  </button>
                  <textarea
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none font-body-md text-sm text-on-background py-2 px-1 max-h-32 min-h-[40px] outline-none"
                    placeholder="Tulis pesan Anda..."
                    rows={1}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity shrink-0 shadow-sm flex items-center justify-center w-10 h-10"
                  >
                    <span className="material-symbols-outlined ml-0.5 text-xl">send</span>
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
              forum
            </span>
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-2">
              Buka Kotak Masuk
            </h3>
            <p className="text-on-surface-variant max-w-sm">
              Pilih salah satu chat aktif di sebelah kiri untuk mulai mengobrol nugas dan bernegosiasi titik COD.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
