"use client";

import Link from "next/link";
import { useActionState, Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";

function LoginFormContent() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

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
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[1200px] w-full bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          <div className="hidden md:block md:w-1/2 relative bg-surface-variant overflow-hidden">
            {images.map((src, index) => (
              <img
                key={src}
                alt="UMM Campus Life"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-85" : "opacity-0"
                }`}
                src={src}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent mix-blend-multiply"></div>
            <div className="absolute bottom-12 left-12 right-12 bg-white/10 backdrop-blur-[12px] p-8 rounded-xl border border-white/20">
              <h2 className="font-headline-lg text-headline-lg text-on-primary mb-4 font-bold">
                Empowering UMM Student Trade
              </h2>
              <p className="font-body-lg text-body-lg text-on-primary/90">
                Join the secure, student-to-student marketplace designed exclusively for the Universitas Muhammadiyah Malang community.
              </p>
              <div className="mt-8 flex gap-3">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      index === currentImageIndex
                        ? "w-8 bg-white"
                        : "w-1.5 bg-white/50"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-surface-container-lowest relative z-10">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-10 text-center md:text-left">
                <Link href="/" className="font-headline-lg text-headline-lg font-bold text-primary block">
                  Lapak Jas Merah
                </Link>
                <span className="font-body-md text-body-md text-on-surface-variant mt-2 block">
                  Selamat datang kembali di Marketplace Mahasiswa UMM
                </span>
              </div>

              {state?.error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm flex flex-col gap-2 border border-outline-variant/30 text-left">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span className="font-semibold">{state.error}</span>
                  </div>
                  {state.data && (state.data as any).isUnverified && (
                    <div className="mt-1">
                      <Link
                        href={`/verify-email/pending?email=${encodeURIComponent((state.data as any).email)}`}
                        className="text-primary hover:underline font-bold text-xs bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant/30 inline-block"
                      >
                        Verifikasi Akun Sekarang →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form action={formAction} className="space-y-6">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="identifier">
                    NIM atau Email UMM
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <input
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors ${
                        state?.validationErrors?.identifier ? "border-error" : "border-outline-variant"
                      }`}
                      id="identifier"
                      name="identifier"
                      placeholder="Masukkan NIM atau Email UMM Anda"
                      required
                      type="text"
                    />
                  </div>
                  {state?.validationErrors?.identifier && (
                    <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {state.validationErrors.identifier[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                    </div>
                    <input
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface transition-colors ${
                        state?.validationErrors?.password ? "border-error" : "border-outline-variant"
                      }`}
                      id="password"
                      name="password"
                      placeholder="Masukkan password Anda"
                      required
                      type="password"
                    />
                  </div>
                  {state?.validationErrors?.password && (
                    <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {state.validationErrors.password[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <input
                      className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface cursor-pointer"
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                    />
                    <label className="ml-2 block font-body-md text-body-md text-on-surface-variant cursor-pointer text-sm" htmlFor="remember-me">
                      Ingat Saya
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link href="/login" className="font-label-md text-label-md text-primary hover:underline hover:text-primary-container transition-colors font-semibold">
                      Lupa Password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    disabled={isPending}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 font-bold"
                    type="submit"
                  >
                    {isPending ? "Memproses..." : "Masuk ke Akun"}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  Belum punya akun?
                  <Link href="/register" className="font-label-md text-label-md text-primary hover:underline ml-1 font-bold">
                    Daftar Sekarang
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link href="/" className="text-xs text-on-surface-variant hover:text-primary transition-colors hover:underline">
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-low w-full py-12 border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-title-lg text-title-lg font-bold text-primary">
            Lapak Jas Merah
          </div>
          <div className="font-label-md text-label-md text-on-surface-variant text-sm text-center">
            © 2024 Lapak Jas Merah - Universitas Muhammadiyah Malang. Student-to-Student Marketplace.
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 font-label-md text-label-md text-sm font-semibold">
            <Link href="/" className="text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-colors">Terms of Service</Link>
            <Link href="/" className="text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-colors">Privacy Policy</Link>
            <Link href="/" className="text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-colors">Help Center</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center font-body-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-sm">Memuat Halaman Login...</p>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
