"use client";

import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    category: "Akun & Verifikasi",
    question: "Bagaimana cara memverifikasi akun saya?",
    answer: "Anda dapat memverifikasi akun Anda dengan mengunggah foto Kartu Tanda Mahasiswa (KTM) aktif UMM melalui halaman Dashboard Seller. Tim admin kami akan memeriksa dokumen Anda dalam waktu 1x24 jam untuk memastikan keaslian status mahasiswa UMM."
  },
  {
    id: 2,
    category: "Akun & Verifikasi",
    question: "Mengapa pendaftaran harus menggunakan email UMM?",
    answer: "Untuk menjaga ekosistem Lapak Jas Merah tetap aman dan tepercaya, kami membatasi transaksi hanya untuk civitas akademika Universitas Muhammadiyah Malang. Verifikasi email webmail UMM (@webmail.umm.ac.id) adalah langkah pertama untuk memastikan Anda adalah mahasiswa aktif."
  },
  {
    id: 3,
    category: "Jual & Beli",
    question: "Bagaimana cara menjual barang di Lapak Jas Merah?",
    answer: "Masuk ke akun Anda, buka 'Seller Panel' di bagian navigasi atas, lalu klik 'Tambah Produk'. Lengkapi formulir produk mulai dari foto, judul, harga, deskripsi barang, fakultas, hingga tipe transaksi (Penjualan biasa, Barter, atau Lelang)."
  },
  {
    id: 4,
    category: "Jual & Beli",
    question: "Apakah transaksi di platform ini dikenakan biaya admin?",
    answer: "Tidak ada biaya admin sama sekali. Lapak Jas Merah adalah platform non-profit yang dikembangkan khusus sebagai wadah saling bantu antar mahasiswa UMM. Semua hasil penjualan 100% menjadi milik penjual."
  },
  {
    id: 5,
    category: "Keamanan & COD",
    question: "Apa itu Safe Zone COD?",
    answer: "Safe Zone COD adalah lokasi-lokasi strategis dan ramai di sekitar Kampus UMM yang kami rekomendasikan sebagai tempat pertemuan (Cash on Delivery). Tempat-tempat ini diawasi oleh petugas keamanan kampus dan terpantau CCTV (seperti area helipad, depan GKB, atau Masjid AR Fachruddin), sehingga mengurangi risiko penipuan atau tindak kejahatan."
  },
  {
    id: 6,
    category: "Keamanan & COD",
    question: "Bagaimana cara melaporkan pengguna yang mencurigakan?",
    answer: "Jika Anda menemui produk palsu, deskripsi tidak sesuai, atau indikasi penipuan, Anda dapat mengeklik tombol 'Laporkan' yang berada di halaman detail produk atau profil penjual. Admin kami akan segera meninjau laporan tersebut dan menindak tegas berupa pemblokiran akun dan blacklist NIM jika terbukti melanggar."
  },
  {
    id: 7,
    category: "Fitur Lainnya",
    question: "Bagaimana cara kerja fitur Wishlist Matcher?",
    answer: "Jika barang yang Anda cari sedang tidak tersedia, Anda bisa membuat Request Item atau memasukkan kata kunci ke daftar keinginan. Ketika ada penjual lain yang mengunggah barang yang cocok dengan kriteria Anda, sistem akan secara otomatis mengirimkan notifikasi ke chat atau dashboard Anda."
  },
  {
    id: 8,
    category: "Fitur Lainnya",
    question: "Bagaimana sistem lelang (auction) bekerja?",
    answer: "Penjual dapat mengaktifkan opsi lelang saat membuat produk dengan menentukan harga awal dan batas waktu lelang. Pembeli dapat mengajukan penawaran (bid) di atas penawaran saat ini. Setelah waktu habis, penawar tertinggi akan dinyatakan sebagai pemenang dan dapat melanjutkan transaksi via chat."
  }
];

export default function HelpContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  const categories = ["Semua", "Akun & Verifikasi", "Jual & Beli", "Keamanan & COD", "Fitur Lainnya"];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: number) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="w-full">
      {/* Search & Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 px-container-margin md:px-[80px] border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto text-center">
          <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Layanan Bantuan
          </span>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mt-4 mb-6">
            Ada yang Bisa Kami Bantu?
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto mb-8">
            Cari jawaban instan untuk pertanyaan Anda mengenai verifikasi KTM, titik aman COD, lelang barang, dan lainnya.
          </p>

          <div className="w-full max-w-xl mx-auto relative">
            <div className="flex items-center bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline rounded-full px-5 py-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
              <input
                className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 focus:outline-none"
                placeholder="Cari pertanyaan atau kata kunci (misal: COD, KTM)..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-section-gap px-container-margin md:px-[80px] max-w-4xl mx-auto">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setExpandedFaqId(null);
              }}
              className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                activeCategory === category
                  ? "bg-primary text-on-primary shadow-sm font-semibold"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center text-left p-6 font-title-lg text-title-lg font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`material-symbols-outlined text-primary-fixed-dim transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-primary" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? "max-h-[300px] border-t border-outline-variant/20 bg-surface-container-low/20" : "max-h-0"
                    }`}
                  >
                    <div className="p-6 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/60">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">
                help_outline
              </span>
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-1">
                Tidak ada hasil ditemukan
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Support Section */}
      <section className="bg-surface-container-low py-12 px-container-margin md:px-[80px] border-t border-outline-variant/20">
        <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <div>
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                Masih memiliki pertanyaan?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tim admin dan pengelola Lapak Jas Merah siap membantu Anda.
              </p>
            </div>
          </div>
          <a
            href="/contact"
            className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm font-semibold whitespace-nowrap cursor-pointer"
          >
            Hubungi Kami
          </a>
        </div>
      </section>
    </div>
  );
}
