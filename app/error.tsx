"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GLOBAL ERROR BOUNDARY]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-container-margin py-section-gap font-body-md antialiased text-on-background">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
        <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl text-error">error</span>
        </div>

        <h2 className="font-headline-md text-2xl font-bold mb-3 font-display-lg text-on-surface">
          Terjadi Kesalahan Sistem
        </h2>

        <p className="text-on-surface-variant font-body-md mb-8 leading-relaxed">
          Maaf, terjadi kesalahan yang tidak terduga saat memproses halaman ini. Tim kami telah diberitahu tentang masalah ini.
        </p>

        {error.digest && (
          <div className="bg-surface-container-low rounded-lg p-3 mb-6 text-left">
            <span className="font-bold text-xs text-on-surface-variant block mb-1">
              ID Kesalahan:
            </span>
            <code className="text-xs break-all text-error font-mono">{error.digest}</code>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm text-sm"
          >
            Coba Lagi
          </button>
          <Link
            href="/marketplace"
            className="w-full border border-secondary text-secondary py-3 rounded-lg hover:bg-surface-container-low transition-colors font-semibold text-sm block"
          >
            Kembali ke Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
