import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keamanan Transaksi - Lapak Jas Merah UMM",
  description: "Panduan bertransaksi secara aman melalui Cash on Delivery (COD) di Safe Zone kampus UMM dan tips menghindari penipuan.",
};

const SAFE_ZONES = [
  {
    name: "Helipad UMM (Kampus III)",
    description: "Area terbuka yang luas dan ramai mahasiswa. Sangat ideal untuk bertransaksi pada pagi hingga sore hari.",
    icon: "flight_land"
  },
  {
    name: "Halaman Masjid AR Fachruddin",
    description: "Titik kumpul yang sangat aman karena diawasi oleh CCTV masjid 24 jam dan memiliki pencahayaan yang sangat baik di malam hari.",
    icon: "mosque"
  },
  {
    name: "Lobi & Depan GKB I",
    description: "Dekat dengan pos keamanan utama UMM. Sangat disarankan karena lalu lalang mahasiswa yang ramai memastikan keamanan maksimal.",
    icon: "corporate_fare"
  },
  {
    name: "Gazebo Danau UMM (Dekat GKB IV)",
    description: "Tempat santai yang nyaman untuk menguji fungsi barang (seperti laptop atau gawai) sebelum melakukan pembayaran.",
    icon: "forest"
  }
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 px-container-margin md:px-[80px] border-b border-outline-variant/20">
          <div className="max-w-4xl mx-auto text-center">
            <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Keamanan Transaksi
            </span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mt-4 mb-6">
              Sistem COD & Safe Zone Kampus UMM
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Lapak Jas Merah mengutamakan keamanan bertransaksi antar mahasiswa. Pelajari rekomendasi Safe Zone kami dan tips bertransaksi agar Anda selalu aman.
            </p>
          </div>
        </section>

        {/* Safe Zones Section */}
        <section className="py-section-gap px-container-margin md:px-[80px] max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-3">
              Rekomendasi Safe Zone COD
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Kami menyarankan Anda bertemu di titik-titik berikut untuk melakukan transaksi pembayaran di tempat (COD) demi keamanan bersama:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {SAFE_ZONES.map((zone, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest border border-outline-variant/45 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-primary/40 transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">{zone.icon}</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">
                    {zone.name}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {zone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Features */}
        <section className="py-section-gap px-container-margin md:px-[80px] bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-3">
                Fitur Keamanan Kami
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Cara kami menjaga lingkungan jual-beli di Lapak Jas Merah tetap bersih dan terpercaya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-4">
                  verified
                </span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">
                  Verifikasi KTM/NIM
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Setiap penjual wajib mengunggah KTM asli. Akun mereka baru bisa memajang barang setelah diverifikasi oleh admin UMM.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-4">
                  report_problem
                </span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">
                  Pelaporan Instan
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Ada tombol laporkan pada setiap produk dan profil. Tim peninjau kami memonitor aduan 24/7 untuk menindak indikasi penipuan.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-4">
                  lock_open
                </span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">
                  Perlindungan Data
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Informasi kontak pribadi Anda dilindungi. Komunikasi awal dilakukan via chat internal sistem demi privasi Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Tips (Buyers vs Sellers) */}
        <section className="py-section-gap px-container-margin md:px-[80px] max-w-5xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface text-center mb-12">
            Panduan Tips Bertransaksi Aman
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tips for Buyers */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary text-3xl">
                  shopping_bag
                </span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Tips untuk Pembeli
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Jangan bayar di muka:</strong> Hindari mentransfer DP (Down Payment) sebelum Anda bertemu secara langsung dengan penjual.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Periksa barang secara detail:</strong> Cek kondisi fisik, kelengkapan, dan pastikan berfungsi dengan baik sebelum menyerahkan uang.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Gunakan Safe Zone UMM:</strong> Selalu ajak penjual untuk melakukan COD di area kampus yang direkomendasikan.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Waspadai harga tidak wajar:</strong> Jika harga suatu barang terlalu murah secara tidak masuk akal, tingkatkan kewaspadaan Anda.
                  </p>
                </li>
              </ul>
            </div>

            {/* Tips for Sellers */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">
                  storefront
                </span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Tips untuk Penjual
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Deskripsikan barang dengan jujur:</strong> Sampaikan kondisi asli barang di bagian deskripsi untuk mencegah kesalahpahaman saat COD.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Lakukan transaksi di tempat umum:</strong> Hindari mengantarkan barang sendirian ke tempat sepi di luar kampus UMM.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Hitung & periksa uang:</strong> Jika menerima tunai, periksa keaslian lembaran uang tersebut. Jika via transfer, pastikan dana masuk ke rekening (cek mutasi).
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Simpan bukti percakapan:</strong> Dokumentasikan kesepakatan harga dan detail pertemuan di fitur chat demi referensi cadangan jika ada sengketa.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support Call-to-action */}
        <section className="bg-surface-container-low py-12 px-container-margin md:px-[80px]">
          <div className="max-w-4xl mx-auto bg-error-container/20 border border-error/20 rounded-2xl p-8 shadow-sm text-center">
            <span className="material-symbols-outlined text-error text-4xl mb-3">
              gavel
            </span>
            <h3 className="font-title-lg text-title-lg font-bold text-on-error-container mb-2">
              Mengalami Percobaan Penipuan?
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto mb-6">
              Lapor segera ke tim moderasi Lapak Jas Merah. Kami dapat memblacklist NIM pelanggar agar tidak dapat mendaftar lagi di kemudian hari.
            </p>
            <a
              href="/contact"
              className="bg-error text-on-error font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-error/90 transition-colors shadow-sm font-semibold inline-block cursor-pointer"
            >
              Laporkan Pengguna
            </a>
          </div>
        </section>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
