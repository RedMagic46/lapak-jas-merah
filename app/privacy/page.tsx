import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Lapak Jas Merah UMM",
  description: "Kebijakan privasi data pengguna dan perlindungan informasi pribadi mahasiswa di Lapak Jas Merah Universitas Muhammadiyah Malang.",
};

const SECTIONS = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    content: "Kami mengumpulkan beberapa informasi dasar saat Anda mendaftar di platform kami demi kelancaran dan keamanan transaksi. Informasi tersebut mencakup: (a) Identitas Pribadi: Nama Lengkap dan Nomor Induk Mahasiswa (NIM). (b) Kontak Resmi: Alamat email resmi UMM (@webmail.umm.ac.id). (c) Verifikasi Fisik: Foto Kartu Tanda Mahasiswa (KTM). (d) Data Aktivitas: Unggahan produk, riwayat chat internal, dan riwayat transaksi."
  },
  {
    title: "2. Penggunaan Informasi",
    content: "Semua informasi yang kami kumpulkan digunakan secara eksklusif untuk tujuan operasional Lapak Jas Merah, antara lain: (a) Memverifikasi keabsahan status Anda sebagai mahasiswa aktif UMM. (b) Menghubungkan pembeli dan penjual melalui sistem chat terintegrasi. (c) Mengirimkan notifikasi kecocokan barang (Wishlist Matcher). (d) Melakukan investigasi keamanan jika terjadi aduan atau laporan penyalahgunaan platform."
  },
  {
    title: "3. Keamanan dan Penyimpanan Data",
    content: "Keamanan data Anda adalah prioritas utama kami. Kami menerapkan langkah-langkah keamanan teknologi terstandar: (a) Enkripsi Password: Sandi Anda di-hash menggunakan algoritma pengacak satu arah (Bcrypt) sehingga tidak dapat dibaca oleh admin sekalipun. (b) Enkripsi Transportasi: Data ditransfer menggunakan protokol aman HTTPS. (c) Perlindungan Database: Database dilindungi oleh firewall ketat untuk mencegah akses tanpa izin."
  },
  {
    title: "4. Pembagian Data dengan Pihak Ketiga",
    content: "Lapak Jas Merah berkomitmen tidak akan pernah menjual, menyewakan, atau memberikan informasi pribadi pengguna kepada pihak ketiga di luar kebutuhan operasional UMM. Namun, kami dapat menyerahkan data Anda kepada pihak berwenang kampus (seperti Biro Kemahasiswaan atau tim disiplin kampus UMM) jika terbukti ada pelanggaran hukum atau penipuan berat."
  },
  {
    title: "5. Hak Pengguna atas Data",
    content: "Sebagai pengguna, Anda memiliki hak penuh atas data Anda sendiri: (a) Hak Akses dan Koreksi: Anda dapat mengubah nama, fakultas, foto profil, dan info produk secara berkala di halaman Pengaturan. (b) Hak Penghapusan Akun: Jika Anda ingin menghapus seluruh riwayat data Anda dari sistem kami setelah lulus atau tidak lagi memakai platform, Anda dapat menghubungi admin melalui email dukungan."
  },
  {
    title: "6. Kebijakan Cookies",
    content: "Kami menggunakan token sesi yang aman (session tokens) yang disimpan di browser Anda untuk mengidentifikasi status login Anda. Cookie/token ini hanya digunakan untuk kenyamanan navigasi agar Anda tidak perlu login ulang setiap kali berpindah halaman."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 px-container-margin md:px-[80px] border-b border-outline-variant/20">
          <div className="max-w-4xl mx-auto text-center">
            <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Privasi
            </span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mt-4 mb-6">
              Kebijakan Privasi Data
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Kami berkomitmen penuh untuk melindungi privasi data pribadi mahasiswa UMM. Pelajari bagaimana kami mengumpulkan, mengamankan, dan menggunakan data Anda.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-section-gap px-container-margin md:px-[80px] max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/45 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="border-b border-outline-variant/30 pb-4 mb-6">
              <p className="text-sm text-on-surface-variant font-semibold">
                Terakhir diperbarui: 23 Juni 2026
              </p>
            </div>

            <div className="space-y-8">
              {SECTIONS.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="font-title-lg text-title-lg font-bold text-primary">
                    {section.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-justify">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-6 mt-12 text-center bg-surface-container-low/20 p-6 rounded-xl">
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                Ada pertanyaan atau kekhawatiran khusus mengenai privasi data Anda di platform ini?
              </p>
              <a
                href="/contact"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors font-semibold inline-block cursor-pointer"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </section>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
