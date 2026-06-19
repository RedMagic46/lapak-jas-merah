import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import Link from "next/link";
import ResendVerificationForm from "@/components/ResendVerificationForm";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mb-6">
              <span className="material-symbols-outlined text-[36px]">cancel</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-3 font-bold">Verifikasi Gagal</h1>
            <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
              Tautan verifikasi tidak ditemukan atau format tautan salah.
            </p>
            <Link href="/login" className="w-full bg-primary text-on-primary py-3 px-6 rounded-lg font-bold hover:bg-primary-container inline-block text-center transition-colors">
              Kembali ke Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord) {
      return (
        <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
          <main className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mb-6">
                <span className="material-symbols-outlined text-[36px]">cancel</span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-3 font-bold">Tautan Tidak Valid</h1>
              <p className="text-on-surface-variant mb-8 text-sm leading-relaxed font-body-md">
                Tautan verifikasi ini salah, sudah pernah digunakan, atau sudah dihapus. Silakan coba masuk kembali untuk mendapatkan tautan baru.
              </p>
              <Link href="/login" className="w-full bg-primary text-on-primary py-3 px-6 rounded-lg font-bold hover:bg-primary-container inline-block text-center transition-colors">
                Kembali ke Login
              </Link>
            </div>
          </main>
        </div>
      );
    }

    
    if (tokenRecord.expiresAt < new Date()) {
      
      await prisma.emailVerificationToken.delete({
        where: { id: tokenRecord.id },
      });

      return (
        <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
          <main className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mb-6">
                <span className="material-symbols-outlined text-[36px]">history</span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-3 font-bold">Tautan Kedaluwarsa</h1>
              <p className="text-on-surface-variant mb-6 text-sm leading-relaxed">
                Tautan verifikasi sudah kedaluwarsa (berlaku 24 jam). Anda bisa mengirim ulang tautan baru di bawah ini:
              </p>
              <ResendVerificationForm email={tokenRecord.user.email} />
              <div className="mt-6 pt-4 border-t border-outline-variant/20 w-full">
                <Link href="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors font-semibold">
                  Kembali ke Halaman Login
                </Link>
              </div>
            </div>
          </main>
        </div>
      );
    }

    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { isEmailVerified: true },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: tokenRecord.id },
      }),
    ]);

    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-3 font-bold">Verifikasi Berhasil</h1>
            <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
              Email Anda (<strong>{tokenRecord.user.email}</strong>) telah berhasil diverifikasi. Sekarang Anda bisa masuk untuk berbelanja dan berjualan di Lapak Jas Merah!
            </p>
            <Link href="/login" className="w-full bg-primary text-on-primary py-3 px-6 rounded-lg font-bold hover:bg-primary-container inline-block text-center transition-colors shadow-sm">
              Login Sekarang
            </Link>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("[VERIFY EMAIL ERROR]:", error);
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mb-6">
              <span className="material-symbols-outlined text-[36px]">error</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-3 font-bold">Terjadi Kesalahan</h1>
            <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
              Gagal memproses verifikasi email karena kesalahan server. Silakan coba beberapa saat lagi.
            </p>
            <Link href="/login" className="w-full bg-primary text-on-primary py-3 px-6 rounded-lg font-bold hover:bg-primary-container inline-block text-center transition-colors">
              Kembali ke Login
            </Link>
          </div>
        </main>
      </div>
    );
  }
}
