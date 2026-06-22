"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createTransactionRequest } from "@/app/actions/transactions";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant font-semibold">
      Memuat Peta...
    </div>
  )
});

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isService: boolean;
  seller: {
    name: string;
  };
}

interface TransactionFormProps {
  productId: string;
  product: Product;
}

interface LocationPin {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  top: string;
  left: string;
  tags: string[];
  lat?: number;
  lng?: number;
}

// Predefined default point
const defaultLocation = "Titik Pertemuan (-7.92140, 112.59750)";

export default function TransactionForm({
  productId,
  product,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Meetup Location State
  const [meetingMode, setMeetingMode] = useState<"physical" | "online">(
    product.isService ? "online" : "physical"
  );
  
  const [selectedPin, setSelectedPin] = useState<LocationPin | null>(
    product.isService ? null : {
      id: "custom",
      name: defaultLocation,
      label: "Titik COD",
      description: "Koordinat default (Universitas Muhammadiyah Malang Kampus 3). Klik di mana saja pada peta untuk mengubah lokasi.",
      icon: "location_on",
      top: "0%",
      left: "0%",
      tags: ["Lokasi Pilihan", "Kampus 3 UMM"],
      lat: -7.9214,
      lng: 112.5975
    }
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    product.isService ? "Pertemuan Online via Zoom/Google Meet/Discord" : defaultLocation
  );

  // Date and Time Slot State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10) // default to tomorrow
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("11:30");

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<string>("COD_CASH");

  // Update location string when toggling meetingMode
  useEffect(() => {
    if (meetingMode === "online") {
      setSelectedLocation("Pertemuan Online via Zoom/Google Meet/Discord");
    } else {
      if (selectedPin) {
        setSelectedLocation(selectedPin.name);
      } else {
        setSelectedLocation(defaultLocation);
        setSelectedPin({
          id: "custom",
          name: defaultLocation,
          label: "Titik COD",
          description: "Koordinat default (Universitas Muhammadiyah Malang Kampus 3). Klik di mana saja pada peta untuk mengubah lokasi.",
          icon: "location_on",
          top: "0%",
          left: "0%",
          tags: ["Lokasi Pilihan", "Kampus 3 UMM"],
          lat: -7.9214,
          lng: 112.5975
        });
      }
    }
  }, [meetingMode]);

  const handleMapChange = (locationName: string, lat: number, lng: number) => {
    setSelectedLocation(locationName);
    setSelectedPin({
      id: "custom",
      name: locationName,
      label: "Titik COD",
      description: `Koordinat pilihan Anda: ${lat.toFixed(5)}, ${lng.toFixed(5)}. Pastikan lokasi ini disepakati bersama penjual di chat.`,
      icon: "location_on",
      top: "0%",
      left: "0%",
      tags: ["Titik Kustom", "Pilihan Peta"],
      lat,
      lng
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("meetupLocation", selectedLocation);
    
    if (selectedDate && selectedTimeSlot) {
      formData.set("meetupTime", `${selectedDate}T${selectedTimeSlot}:00`);
    } else {
      formData.set("meetupTime", "");
    }
    
    formData.set("paymentMethod", paymentMethod);

    try {
      const res = await createTransactionRequest(productId, formData);
      if (res.success) {
        window.location.href = "/chat";
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
      setError("Gagal mengirim pengajuan COD. Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Map and Selected Location */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Meeting Type Selection for Services */}
        {product.isService && (
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20">
            <h3 className="font-title-lg text-title-lg text-on-background mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              Pilih Metode Pertemuan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMeetingMode("online")}
                className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  meetingMode === "online"
                    ? "border-primary bg-primary/5 text-primary font-bold"
                    : "border-outline-variant/35 bg-surface text-on-surface-variant hover:border-primary/40"
                }`}
              >
                <span className="material-symbols-outlined text-xl">devices</span>
                <span className="text-sm">Pertemuan Online</span>
                <span className="text-[10px] opacity-75 font-normal">Zoom, Meet, Discord</span>
              </button>
              <button
                type="button"
                onClick={() => setMeetingMode("physical")}
                className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  meetingMode === "physical"
                    ? "border-primary bg-primary/5 text-primary font-bold"
                    : "border-outline-variant/35 bg-surface text-on-surface-variant hover:border-primary/40"
                }`}
              >
                <span className="material-symbols-outlined text-xl">location_on</span>
                <span className="text-sm">Tatap Muka (Offline)</span>
                <span className="text-[10px] opacity-75 font-normal">COD Kampus UMM</span>
              </button>
            </div>
          </div>
        )}

        {/* UMM Map Card (Rendered only for physical meetups) */}
        {meetingMode === "physical" && (
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 relative z-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-title-lg text-title-lg text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                Pilih Titik Pertemuan COD
              </h2>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                Gunakan Peta Interaktif
              </div>
            </div>
            
            <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30">
              <LeafletMap
                mode="interactive"
                selectedLocationName={selectedLocation}
                onChange={handleMapChange}
              />
            </div>
          </div>
        )}

        {/* Location details summary block */}
        <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20">
          <h3 className="font-title-lg text-title-lg text-on-background mb-4">Lokasi Pertemuan Terpilih</h3>
          {meetingMode === "online" ? (
            <div className="flex items-start gap-4 p-4 border border-outline-variant/40 rounded-lg bg-surface-bright">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">devices</span>
              </div>
              <div>
                <h4 className="font-title-lg text-sm md:text-base text-on-background">Pertemuan Online</h4>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Metode pertemuan online untuk tutor sebaya. Tautan Zoom/Google Meet/Discord akan disepakati melalui percakapan chat.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="bg-surface-container-high text-on-surface text-[10px] px-2 py-0.5 rounded font-semibold">Online</span>
                  <span className="bg-surface-container-high text-on-surface text-[10px] px-2 py-0.5 rounded font-semibold">Tutor / Jasa</span>
                </div>
              </div>
            </div>
          ) : (
            selectedPin && (
              <div className="flex items-start gap-4 p-4 border border-outline-variant/40 rounded-lg bg-surface-bright">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">{selectedPin.icon}</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-title-lg text-sm md:text-base text-on-background">{selectedPin.name.split(" (")[0]}</h4>
                  <p className="font-body-md text-xs text-on-surface-variant mt-1">{selectedPin.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {selectedPin.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container-high text-on-surface text-[10px] px-2 py-0.5 rounded font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
          {validationErrors.meetupLocation && (
            <p className="text-error text-xs mt-2 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">error</span>
              {validationErrors.meetupLocation[0]}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Time Scheduling, Payment, Safety Tips, Action */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* General Error Alert */}
        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl font-body-md text-sm flex items-center gap-2 border border-outline-variant/35 text-left">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Schedule form parameters */}
        <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20">
          <h2 className="font-title-lg text-title-lg text-on-background flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">schedule</span>
            Jadwalkan Waktu
          </h2>
          
          <div className="space-y-5">
            {/* Date Selection */}
            <div>
              <label className="block font-label-md text-[10px] text-on-surface-variant mb-2 uppercase font-bold tracking-wide">
                Pilih Tanggal
              </label>
              <div className="relative">
                <input
                  required
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2.5 font-body-md text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>

            {/* Time Selector */}
            <div>
              <label className="block font-label-md text-[10px] text-on-surface-variant mb-2 uppercase font-bold tracking-wide">
                Jam Pertemuan
              </label>
              <div className="relative">
                <input
                  required
                  type="time"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2.5 font-body-md text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
              {validationErrors.meetupTime && (
                <p className="text-error text-xs mt-2 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {validationErrors.meetupTime[0]}
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-label-md text-[10px] text-on-surface-variant mb-2 uppercase font-bold tracking-wide">
                Metode Pembayaran
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD_CASH")}
                  className={`w-full text-left py-2.5 px-3 rounded-lg border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === "COD_CASH"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-outline-variant/35 bg-surface text-on-surface hover:border-primary/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <div className="text-xs">
                    <p className="font-bold">Tunai Saat Bertemu (COD)</p>
                    <p className="text-[10px] text-on-surface-variant/75 font-normal">Bayar langsung ke penjual di tempat</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ESCROW_TRANSFER")}
                  className={`w-full text-left py-2.5 px-3 rounded-lg border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === "ESCROW_TRANSFER"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-outline-variant/35 bg-surface text-on-surface hover:border-primary/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">account_balance</span>
                  <div className="text-xs">
                    <p className="font-bold">Rekber - Transfer Bank</p>
                    <p className="text-[10px] text-on-surface-variant/75 font-normal">Saldo ditahan sistem, aman 100%</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ESCROW_QRIS")}
                  className={`w-full text-left py-2.5 px-3 rounded-lg border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === "ESCROW_QRIS"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-outline-variant/35 bg-surface text-on-surface hover:border-primary/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">qr_code_2</span>
                  <div className="text-xs">
                    <p className="font-bold">Rekber - QRIS UMM Pay</p>
                    <p className="text-[10px] text-on-surface-variant/75 font-normal">Scan instan pembayaran aman platform</p>
                  </div>
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant/65 mt-2 leading-relaxed">
                * Gunakan Rekening Bersama (Escrow) untuk perlindungan anti-penipuan.
              </p>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block font-label-md text-[10px] text-on-surface-variant mb-2 uppercase font-bold tracking-wide" htmlFor="notes">
                Catatan Pertemuan (Opsional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Misal: Saya pakai almamater merah / jaket biru, nunggu di dekat pintu lobby utama..."
                className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
              ></textarea>
              {validationErrors.notes && (
                <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {validationErrors.notes[0]}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-primary hover:bg-primary-container text-on-primary font-bold py-3 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-on-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengajukan...
              </>
            ) : (
              "Kirim Pengajuan COD"
            )}
          </button>
        </div>

        {/* Safety Tips Card */}
        <div className="bg-secondary-container/10 border border-secondary-container/20 rounded-xl p-card-padding shadow-sm">
          <h3 className="font-title-lg text-sm text-on-secondary-container flex items-center gap-2 mb-3 font-bold">
            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            Tips Transaksi Aman
          </h3>
          <ul className="space-y-2.5 text-xs text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>Selalu lakukan COD di **Safe Zone UMM** resmi yang terpantau CCTV dan ramai pejalan kaki.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>Periksa kondisi fisik barang atau kelayakan jasa secara teliti sebelum menyerahkan pembayaran.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>Gunakan chat dalam aplikasi Lapak Jas Merah sebagai bukti resmi komunikasi kesepakatan.</span>
            </li>
          </ul>
        </div>
      </div>
    </form>
  );
}
