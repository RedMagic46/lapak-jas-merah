import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-container-margin py-section-gap font-body-md antialiased text-on-background">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
        <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl text-secondary">search_off</span>
        </div>

        <h2 className="font-headline-md text-2xl font-bold mb-3 font-display-lg text-on-surface">
          Halaman Tidak Ditemukan
        </h2>

        <p className="text-on-surface-variant font-body-md mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin alamat URL salah atau halaman telah dihapus.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/marketplace"
            className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm text-sm block"
          >
            Jelajahi Marketplace
          </Link>
          <Link
            href="/"
            className="w-full border border-secondary text-secondary py-3 rounded-lg hover:bg-surface-container-low transition-colors font-semibold text-sm block"
          >
            Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
