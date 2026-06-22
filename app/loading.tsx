export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-primary animate-pulse">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <span className="material-symbols-outlined text-6xl text-primary animate-bounce">
          storefront
        </span>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
          Memuat Lapak Jas Merah...
        </h2>
        <p className="text-sm text-on-surface-variant max-w-xs mt-1">
          Menyiapkan marketplace mahasiswa UMM terpercaya untuk Anda
        </p>
      </div>
    </div>
  );
}
