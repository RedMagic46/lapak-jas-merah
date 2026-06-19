"use client";

import { useActionState, useState, useEffect, startTransition } from "react";
import { resendVerificationAction } from "@/app/actions/auth";

interface ResendVerificationFormProps {
  email: string;
}

export default function ResendVerificationForm({ email }: ResendVerificationFormProps) {
  const [state, formAction, isPending] = useActionState(resendVerificationAction, null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (state?.success) {
      setCooldown(60); 
    }
  }, [state]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cooldown > 0 || isPending) return;
    
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="w-full mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="email" value={email} />

        {state?.error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2 border border-outline-variant/30 text-left">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2 border border-emerald-200 text-left">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>Tautan verifikasi baru berhasil dikirim. Silakan periksa inbox/spam email Anda!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || cooldown > 0}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 font-bold items-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Mengirim Ulang...</span>
            </>
          ) : cooldown > 0 ? (
            <span>Kirim Ulang Tersedia dalam {cooldown}s</span>
          ) : (
            <span>Kirim Ulang Email Verifikasi</span>
          )}
        </button>
      </form>
    </div>
  );
}
