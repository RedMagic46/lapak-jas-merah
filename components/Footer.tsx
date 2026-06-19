import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full px-container-margin grid grid-cols-1 md:grid-cols-4 gap-gutter border-t border-outline-variant py-section-gap bg-surface-container-highest dark:bg-surface-container-high md:px-[80px]">
      <div className="md:col-span-1 mb-6 md:mb-0">
        <h2 className="font-headline-lg text-headline-lg font-bold text-primary mb-4">Lapak Jas Merah</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Marketplace kebanggaan mahasiswa Universitas Muhammadiyah Malang.
        </p>
      </div>
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col gap-2">
          <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Pusat Bantuan
          </Link>
          <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Keamanan Transaksi
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Syarat &amp; Ketentuan
          </Link>
          <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Kebijakan Privasi
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Hubungi Kami
          </Link>
        </div>
      </div>
      <div className="col-span-1 md:col-span-4 mt-8 pt-8 border-t border-outline-variant text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          © 2024 Lapak Jas Merah Universitas Muhammadiyah Malang
        </p>
      </div>
    </footer>
  );
}
