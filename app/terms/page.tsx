import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - Lapak Jas Merah UMM",
  description: "Syarat dan ketentuan layanan penggunaan platform marketplace Lapak Jas Merah Universitas Muhammadiyah Malang.",
};

const SECTIONS = [
  {
    title: "1. Ketentuan Umum",
    content: "Lapak Jas Merah adalah platform marketplace komunitas internal mahasiswa Universitas Muhammadiyah Malang (UMM). Platform ini memfasilitasi transaksi penjualan barang bekas/baru, sistem barter, lelang, serta pencarian request barang. Lapak Jas Merah tidak bertindak sebagai perantara transaksi keuangan dan tidak menyimpan dana transaksi."
  },
  {
    title: "2. Kelayakan Pengguna",
    content: "Layanan ini ditujukan hanya untuk mahasiswa aktif Universitas Muhammadiyah Malang. Untuk mendaftar dan menggunakan layanan, Anda wajib memverifikasi akun menggunakan email resmi UMM (@webmail.umm.ac.id) serta mengunggah Kartu Tanda Mahasiswa (KTM) yang valid. Pihak pengelola berhak menolak verifikasi jika data tidak cocok."
  },
  {
    title: "3. Akun dan Keamanan",
    content: "Anda bertanggung jawab menjaga kerahasiaan kata sandi akun Anda. Anda dilarang memberikan akses akun Anda kepada orang lain. Segala aktivitas yang terjadi di bawah akun Anda dianggap sebagai tanggung jawab Anda sepenuhnya. Lapak Jas Merah berhak menangguhkan akun jika terdeteksi aktivitas mencurigakan."
  },
  {
    title: "4. Unggahan Produk dan Transaksi",
    content: "Pengguna diperbolehkan mengunggah produk yang relevan untuk kebutuhan mahasiswa (seperti buku kuliah, jas lab, peralatan kos, pakaian, elektronik). Deskripsi produk harus akurat, jujur, dan tidak menyesatkan. Transaksi sangat disarankan dilakukan secara langsung (COD) di area Safe Zone Kampus UMM."
  },
  {
    title: "5. Kebijakan Barang Terlarang",
    content: "Pengguna dilarang keras mengunggah atau memperdagangkan barang-barang berikut: (a) Zat ilegal, narkotika, obat-obatan keras, dan miras. (b) Senjata tajam atau senjata api. (c) Materi berunsur pornografi atau kekerasan. (d) Barang tiruan/palsu (replika ilegal) yang melanggar hak cipta. (e) Akun akademis ilegal atau dokumen tugas kuliah curang (joki tugas)."
  },
  {
    title: "6. Aturan Lelang & Barter",
    content: "Bila menggunakan fitur lelang, penawar tertinggi wajib menyelesaikan transaksi secara bertanggung jawab. Bila menggunakan fitur barter, kedua belah pihak harus menyetujui detail pertukaran barang sebelum bertemu di Safe Zone. Pembatalan lelang sepihak tanpa alasan yang logis dapat berakibat pada penangguhan akun."
  },
  {
    title: "7. Batasan Tanggung Jawab",
    content: "Lapak Jas Merah menyediakan platform ini dengan dasar 'apa adanya'. Kami tidak bertanggung jawab atas kerugian materiil, penipuan, atau perselisihan yang terjadi antara pembeli dan penjual. Setiap sengketa harus diselesaikan secara kekeluargaan oleh pihak-pihak terkait."
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 px-container-margin md:px-[80px] border-b border-outline-variant/20">
          <div className="max-w-4xl mx-auto text-center">
            <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Legalitas
            </span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mt-4 mb-6">
              Syarat &amp; Ketentuan Layanan
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Harap baca syarat dan ketentuan ini dengan saksama sebelum menggunakan Lapak Jas Merah. Dengan mendaftar, Anda menyetujui semua aturan yang tertera di bawah.
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
                Punya pertanyaan lebih lanjut terkait Syarat &amp; Ketentuan kami?
              </p>
              <a
                href="/contact"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors font-semibold inline-block cursor-pointer"
              >
                Hubungi Admin
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
