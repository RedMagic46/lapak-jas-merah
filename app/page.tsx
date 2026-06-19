import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import type { Product, ForumPost, FAQ, User } from "@prisma/client";

export default async function Home() {

  let products: (Product & { seller: User })[] = [];
  try {
    products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { seller: true }
    }) as (Product & { seller: User })[];
  } catch (error) {
    console.error("Gagal memuat produk rekomendasi:", error);
  }

  let forumPosts: ForumPost[] = [];
  try {
    forumPosts = await prisma.forumPost.findMany({
      take: 3,
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Gagal memuat diskusi forum:", error);
  }

  let faqs: FAQ[] = [];
  try {
    faqs = await prisma.fAQ.findMany({
      take: 4,
    });
  } catch (error) {
    console.error("Gagal memuat FAQ:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <Navbar />

      <main className="flex-1">
        <section className="relative w-full overflow-hidden min-h-[500px] flex items-center justify-center py-section-gap px-container-margin md:px-[80px]">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover"
              alt="UMM Campus Background"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHKghqniAixIPFK7JVUyXEZQ97s0wq8d5jRjvxgAWDr0XgZ84MubPeHQBMSvhJ_NngYmzC4_jH_xFFl6moOlnVHEmUP1XnZsjPurpX9jhSmw8VkkKkf7wCElUkphIeIJQj4i01XYqGpsBCmqqyoMsLIwbhlMHl3NDu-a4FSDArS272leS3K3oX_hqzg2YwCoMy642k9gtxobiUPB97wXC_Tfo5LwDnZpaMTsb1-E_S2zwmob-JPUJC4DYa-cUUyACaMeiMM04ktbA"
            />
            <div className="absolute inset-0 bg-surface/70 backdrop-blur-[12px]"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg font-bold text-on-surface mb-6 drop-shadow-sm leading-tight">
              Marketplace Mahasiswa UMM yang Aman dan Terpercaya
            </h2>
            <div className="w-full max-w-2xl mb-8 relative">
              <form action="/marketplace" method="GET">
                <div className="flex items-center bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline rounded-full px-6 py-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary mr-3">search</span>
                  <input
                    name="search"
                    className="w-full bg-transparent border-none outline-none font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/70 focus:ring-0 focus:outline-none"
                    placeholder="Cari buku, jas lab, atau kos-kosan..."
                    type="text"
                  />
                </div>
              </form>
            </div>
            <div className="flex flex-wrap justify-center gap-gutter">
              <Link
                href="/seller"
                className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm font-semibold"
              >
                Mulai Jual
              </Link>
              <Link
                href="/marketplace"
                className="border-[1.5px] border-secondary text-secondary bg-surface-container-lowest/50 font-label-md text-label-md px-8 py-3 rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors backdrop-blur-sm font-semibold"
              >
                Cari Barang
              </Link>
            </div>
          </div>
        </section>

        <section className="py-section-gap px-container-margin md:px-[80px] bg-surface-container-low">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-8 text-center">
              Kenapa Memilih Kami?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-primary-fixed">verified_user</span>
                </div>
                <h4 className="font-title-lg text-title-lg text-on-surface mb-2 font-bold">NIM Verification</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Keamanan terjamin dengan verifikasi identitas mahasiswa aktif UMM.
                </p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-secondary-fixed">where_to_vote</span>
                </div>
                <h4 className="font-title-lg text-title-lg text-on-surface mb-2 font-bold">Safe Zone COD</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Rekomendasi titik temu aman di area kampus untuk bertransaksi.
                </p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-tertiary-fixed">favorite</span>
                </div>
                <h4 className="font-title-lg text-title-lg text-on-surface mb-2 font-bold">Wishlist Matcher</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Dapatkan notifikasi jika barang yang kamu cari tersedia.
                </p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-primary-fixed">forum</span>
                </div>
                <h4 className="font-title-lg text-title-lg text-on-surface mb-2 font-bold">In-App Chat</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Komunikasi langsung dengan penjual tanpa keluar dari aplikasi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap px-container-margin md:px-[80px] max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64 flex-shrink-0">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-4">Kategori</h3>
              <div className="flex lg:flex-col gap-unit overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
                <Link
                  href="/marketplace?category=Buku+Kuliah"
                  className="flex items-center gap-3 px-4 py-3 bg-surface-container-highest rounded-lg text-on-surface font-label-md text-label-md whitespace-nowrap lg:whitespace-normal hover:bg-primary hover:text-on-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">menu_book</span> Buku Kuliah
                </Link>
                <Link
                  href="/marketplace?category=Jas+Lab"
                  className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface-variant font-label-md text-label-md whitespace-nowrap lg:whitespace-normal hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">science</span> Jas Lab
                </Link>
                <Link
                  href="/marketplace?category=Elektronik"
                  className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface-variant font-label-md text-label-md whitespace-nowrap lg:whitespace-normal hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">devices</span> Elektronik
                </Link>
                <Link
                  href="/marketplace?category=Kost"
                  className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface-variant font-label-md text-label-md whitespace-nowrap lg:whitespace-normal hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">apartment</span> Kost
                </Link>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-end mb-6">
                <h2 className="font-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                  Rekomendasi Terbaru
                </h2>
                <Link href="/marketplace" className="font-label-md text-label-md text-primary hover:underline flex items-center">
                  Lihat Semua{" "}
                  <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/${product.id}`}
                    className="bg-surface-container-lowest rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-card-padding flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[12px] bg-surface-container-low mb-4 overflow-hidden relative">
                      {product.imageUrl && (
                        <img
                          className="w-full h-full object-cover"
                          alt={product.title}
                          src={product.imageUrl}
                        />
                      )}
                      {product.seller.isVerified && (
                        <div className="absolute top-2 right-2 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm font-semibold">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="inline-flex w-fit bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full mb-2">
                        {product.faculty || "Umum"}
                      </div>
                      <h4 className="font-body-md text-body-md text-on-surface font-medium line-clamp-2 mb-1">
                        {product.title}
                      </h4>
                      <p className="font-headline-md text-[18px] leading-tight font-bold text-primary mt-auto">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="forum" className="py-section-gap px-container-margin md:px-[80px] bg-surface-container-lowest border-y border-outline-variant">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                Forum Komunitas
              </h2>
              <Link href="#" className="font-label-md text-label-md text-primary hover:underline flex items-center">
                Semua Diskusi <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {forumPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-primary-container text-on-primary-container text-xs px-2 py-1 rounded-md font-medium">
                      {post.category}
                    </div>
                    <span className="text-xs text-on-surface-variant">Active</span>
                  </div>
                  <h4 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">
                    {post.title}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-on-surface-variant mt-auto">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">favorite</span>{" "}
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">chat_bubble</span>{" "}
                      <span className="text-sm">{post.repliesCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-section-gap px-container-margin md:px-[80px] max-w-7xl mx-auto">
          <div className="bg-secondary text-on-secondary rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row items-center relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="p-8 md:p-12 md:w-1/2 z-10">
              <h2 className="font-headline-lg-mobile md:text-headline-lg font-bold mb-4">
                Dukung Usaha Sekitar Kampus
              </h2>
              <p className="font-body-lg text-body-lg text-secondary-fixed mb-6">
                Temukan layanan fotokopi terdekat, kafe untuk nugas, hingga laundry tepercaya di sekitar UMM. Promosi khusus untuk mahasiswa aktif!
              </p>
              <button className="bg-on-secondary text-secondary font-label-md text-label-md font-bold px-6 py-3 rounded-lg hover:bg-secondary-fixed transition-colors shadow-sm">
                Jelajahi Mitra Lokal
              </button>
            </div>
            <div className="md:w-1/2 h-64 md:h-full min-h-[300px] w-full relative">
              <img
                className="absolute inset-0 w-full h-full object-cover"
                alt="Local cafe near UMM"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6MBkU9lkCcQkBAu8d_80dZW5oibywEsCIoE2fvvZca3w4wT708IZNsD_7w6llShYi6KMcfvWK8RKDiahlSuaW5oNv75ve1aBu7rZRHHazVLNO8WqqC1l6rFCG5wwlVYhc2EzqmYEoRHZRsz0_d9xo5oPJA1njNUbgqn3sdrwHRWf0uXldfNgyadqiHRScas70KQLk6XIhpG_iNxBvFpy_ZSdBVruRClpcLia11Owc_uEc-a3wWnmjpgtomr_RnuIZKOOkFoAegEo"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-secondary to-transparent opacity-90"></div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-section-gap px-container-margin md:px-[80px] bg-surface-container-low border-t border-outline-variant">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-8 text-center">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-surface-container-lowest rounded-lg p-6 shadow-sm border border-outline-variant"
                >
                  <h4 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">
                    {faq.question}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
