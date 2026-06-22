"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  const images = [
    "/images/pemandangan.jpg",
    "/images/kampus.jpg",
    "/images/drone.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="bg-background text-on-background min-h-screen flex font-body-md">
      <div className="flex w-full min-h-screen">
        <div className="hidden md:flex w-1/2 relative bg-surface-container-high overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 z-0">
            {images.map((src, index) => (
              <img
                key={src}
                alt="UMM Campus Life"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-85" : "opacity-0"
                  }`}
                src={src}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary/60 to-transparent mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 flex flex-col items-start justify-end h-full w-full max-w-lg pb-12">
            <div className="mb-8">
              <span className="font-headline-lg text-headline-lg text-on-primary drop-shadow-md font-bold">
                Lapak Jas Merah
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-primary mb-4 leading-tight drop-shadow-md font-bold">
              Join the Student Marketplace
            </h1>
            <p className="font-title-lg text-title-lg text-primary-fixed font-normal opacity-90 drop-shadow-md">
              Create an account to start trading securely within the UMM community.
            </p>
            <div className="mt-12 flex gap-4">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 transition-all duration-300 rounded-full ${index === currentImageIndex
                    ? "w-12 bg-tertiary-fixed"
                    : "w-2 bg-on-primary/50"
                    }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface">
          <div className="w-full max-w-md flex flex-col bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-8">
            <div className="md:hidden mb-8 text-center">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2 font-bold">Lapak Jas Merah</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Buat akun untuk memulai transaksi</p>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Daftar Akun Baru</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Bergabunglah dengan Marketplace Mahasiswa UMM sekarang.
              </p>
            </div>

            {state?.error && (
              <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm flex items-center gap-2 border border-outline-variant/30">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-5">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold" htmlFor="fullName">
                  Nama Lengkap <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full bg-surface-container-lowest border text-on-surface text-body-md font-body-md rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 ${
                    state?.validationErrors?.fullName ? "border-error" : "border-outline-variant"
                  }`}
                  id="fullName"
                  name="fullName"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                  type="text"
                />
                {state?.validationErrors?.fullName && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {state.validationErrors.fullName[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold" htmlFor="nim">
                  NIM (Nomor Induk Mahasiswa) <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full bg-surface-container-lowest border text-on-surface text-body-md font-body-md rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 ${
                    state?.validationErrors?.nim ? "border-error" : "border-outline-variant"
                  }`}
                  id="nim"
                  name="nim"
                  placeholder="202410370311xxx"
                  required
                  type="text"
                />
                {state?.validationErrors?.nim && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {state.validationErrors.nim[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold" htmlFor="email">
                  Email Resmi UMM <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full bg-surface-container-lowest border text-on-surface text-body-md font-body-md rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 ${
                    state?.validationErrors?.email ? "border-error" : "border-outline-variant"
                  }`}
                  id="email"
                  name="email"
                  placeholder="nim@webmail.umm.ac.id"
                  required
                  type="email"
                />
                {state?.validationErrors?.email && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {state.validationErrors.email[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold" htmlFor="password">
                  Password <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full bg-surface-container-lowest border text-on-surface text-body-md font-body-md rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 ${
                    state?.validationErrors?.password ? "border-error" : "border-outline-variant"
                  }`}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                />
                {state?.validationErrors?.password && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {state.validationErrors.password[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold" htmlFor="confirmPassword">
                  Konfirmasi Password <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full bg-surface-container-lowest border text-on-surface text-body-md font-body-md rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 ${
                    state?.validationErrors?.confirmPassword ? "border-error" : "border-outline-variant"
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  type="password"
                />
                {state?.validationErrors?.confirmPassword && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {state.validationErrors.confirmPassword[0]}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer"
                  id="terms"
                  required
                  type="checkbox"
                />
                <label className="font-body-md text-body-md text-on-surface-variant text-sm cursor-pointer" htmlFor="terms">
                  Saya setuju dengan{" "}
                  <Link className="text-primary hover:underline font-semibold" href="/">
                    Syarat Layanan
                  </Link>{" "}
                  dan{" "}
                  <Link className="text-primary hover:underline font-semibold" href="/">
                    Kebijakan Privasi
                  </Link>
                  .
                </label>
              </div>

              <div className="pt-4">
                <button
                  disabled={isPending}
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex justify-center items-center gap-2 disabled:opacity-50 font-bold"
                  type="submit"
                >
                  {isPending ? "Mendaftarkan..." : "Daftar Akun"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Sudah punya akun?{" "}
                <Link className="text-primary font-bold hover:underline" href="/login">
                  Login di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
