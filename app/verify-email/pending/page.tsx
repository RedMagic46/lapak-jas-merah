import Link from "next/link";
import ResendVerificationForm from "@/components/ResendVerificationForm";

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPendingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params.email || "";

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-lg">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 p-8 md:p-10 flex flex-col items-center text-center">
          
          
          <div className="mb-8">
            <Link href="/" className="font-display-lg text-headline-lg font-bold text-primary block tracking-tight">
              Lapak Jas Merah
            </Link>
            <span className="font-body-md text-sm text-on-surface-variant mt-1 block">
              Marketplace Mahasiswa UMM
            </span>
          </div>

          
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6 animate-pulse">
            <span className="material-symbols-outlined text-[48px] font-light">mail</span>
          </div>

          
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold mb-4">
            Verifikasi Email Anda
          </h1>

          
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 text-sm leading-relaxed">
            Kami telah mengirimkan tautan verifikasi ke email resmi UMM Anda:
            {email && (
              <strong className="block text-on-surface mt-2 text-base font-semibold break-all bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/20">
                {email}
              </strong>
            )}
          </p>

          <p className="font-body-md text-xs text-on-surface-variant mb-4 leading-relaxed text-left bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <span className="font-semibold block mb-1 text-primary">Petunjuk Langkah Selanjutnya:</span>
            1. Periksa kotak masuk (inbox) email Anda.<br />
            2. Jika tidak ada, silakan periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.<br />
            3. Klik tombol <strong>Verifikasi Email</strong> di dalam pesan untuk mengaktifkan akun Anda.
          </p>

          
          {email ? (
            <ResendVerificationForm email={email} />
          ) : (
            <p className="text-error text-xs mt-4">
              Error: Alamat email tidak terdeteksi dalam parameter rute.
            </p>
          )}

          
          <div className="mt-8 pt-6 border-t border-outline-variant/30 w-full flex justify-between items-center text-xs font-semibold">
            <Link href="/login" className="text-on-surface-variant hover:text-primary transition-colors hover:underline">
              Kembali ke Login
            </Link>
            <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors hover:underline">
              Ke Beranda
            </Link>
          </div>

        </div>
      </main>

      <footer className="bg-surface-container-low w-full py-8 border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-label-md text-xs text-on-surface-variant">
            © 2024 Lapak Jas Merah - Universitas Muhammadiyah Malang.
          </p>
        </div>
      </footer>
    </div>
  );
}
