import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { toggleWishlist, createReviewAction } from "@/app/actions/products";
import { revalidatePath } from "next/cache";
import AuctionPanel from "@/components/AuctionPanel";
import ModerationButtons from "@/components/ModerationButtons";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthUser();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      wishlists: {
        where: {
          userId: user?.id || "",
        },
      },
      bids: {
        include: {
          bidder: true,
        },
        orderBy: {
          amount: "desc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const isWished = product.wishlists.length > 0;

  const isBlocked = user
    ? await prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: user.id,
            blockedId: product.sellerId,
          },
        },
      })
    : null;

  const completedTransaction = user
    ? await prisma.transaction.findFirst({
        where: {
          productId: id,
          buyerId: user.id,
          status: "COMPLETED",
        },
      })
    : null;

  const alreadyReviewed = user
    ? product.reviews.some((r) => r.userId === user.id)
    : false;

  const canReview = !!completedTransaction && !alreadyReviewed;

  async function handleToggleWishlist() {
    "use server";
    await toggleWishlist(id);
    revalidatePath(`/marketplace/${id}`);
  }

  async function handleAddReview(formData: FormData) {
    "use server";
    const res = await createReviewAction(id, formData);
    if (res.success) {
      revalidatePath(`/marketplace/${id}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-lg">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full pt-8 px-container-margin md:px-[80px] pb-section-gap">
        <div className="mb-6">
          <Link
            href="/marketplace"
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
            Kembali ke Pasar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30">
          <div className="w-full aspect-square bg-surface-container-high rounded-xl overflow-hidden relative border border-outline-variant/30">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )}
            {product.status === "SOLD" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-primary text-on-primary px-6 py-2 rounded-full font-headline-md font-bold uppercase tracking-widest text-lg shadow-md">
                  Terjual (Sold)
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block bg-primary/10 text-primary font-label-md text-label-md px-3 py-1 rounded-full mb-2 font-bold">
                  {product.category}
                </span>
                {product.isAuction && (
                  <span className="inline-block bg-amber-500/10 text-amber-700 font-label-md text-label-md px-3 py-1 rounded-full mb-2 ml-2 font-bold">
                    Lelang
                  </span>
                )}
                {product.isService && (
                  <span className="inline-block bg-blue-500/10 text-blue-700 font-label-md text-label-md px-3 py-1 rounded-full mb-2 ml-2 font-bold">
                    Jasa / Tutor
                  </span>
                )}
                <span className="inline-block bg-surface-container text-on-surface-variant font-label-md text-label-md px-3 py-1 rounded-full mb-2 ml-2">
                  Fakultas {product.faculty || "Umum"}
                </span>
              </div>

              <form action={handleToggleWishlist}>
                <button
                  type="submit"
                  className="p-2 bg-surface hover:bg-surface-container transition-colors rounded-full border border-outline-variant/40 flex items-center justify-center cursor-pointer shadow-sm text-on-surface-variant hover:text-primary"
                  title="Tambah ke Favorit"
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: isWished ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </form>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-tight mb-3">
              {product.title}
            </h1>

            <div className="font-display-lg text-[28px] font-bold text-primary mb-6">
              {product.isAuction ? (
                <span className="text-amber-600">
                  Bid Tertinggi: Rp {(product.currentBid > 0 ? product.currentBid : product.startingBid).toLocaleString("id-ID")}
                </span>
              ) : product.transactionType === "DONATION" ? (
                <span className="text-tertiary">Gratis (Donasi)</span>
              ) : product.transactionType === "BARTER" ? (
                <span className="text-secondary">Barter / Swap</span>
              ) : (
                `Rp ${product.price.toLocaleString("id-ID")}`
              )}
            </div>

            {product.transactionType === "BARTER" && (
              <div className="bg-secondary/10 border border-secondary/20 text-on-surface-variant p-4 rounded-xl mb-6 text-sm">
                <p className="font-bold text-secondary flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-sm">swap_horiz</span>
                  Syarat Barter / Tukar Tambah:
                </p>
                <p>{product.barterWith || "Barang yang setara/sebanding."}</p>
              </div>
            )}

            <div className="border-t border-outline-variant/30 pt-6 mb-8">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-3">
                Deskripsi Barang
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.isAuction && (
              <AuctionPanel
                productId={product.id}
                startingBid={product.startingBid}
                currentBid={product.currentBid}
                auctionEnds={product.auctionEnds}
                bids={product.bids}
                currentUser={user}
                sellerId={product.sellerId}
              />
            )}

            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {product.seller.avatarUrl ? (
                  <img
                    src={product.seller.avatarUrl}
                    alt={product.seller.name}
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant/30 shadow-inner"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                    {product.seller.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-title-lg text-body-lg text-on-surface font-bold">
                    {product.seller.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs text-tertiary">school</span>
                    Mahasiswa {product.seller.faculty || "UMM"}
                  </p>
                </div>
              </div>

              {product.seller.isVerified ? (
                <span className="bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-tertiary-container shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  KTM Verified
                </span>
              ) : (
                <span className="bg-surface-container text-on-surface-variant text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  Belum Verifikasi
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Link
                href={`/chat?partnerId=${product.seller.id}&productId=${product.id}`}
                className="flex-1 flex justify-center items-center gap-2 border-[1.5px] border-secondary text-secondary bg-surface-container-lowest hover:bg-secondary hover:text-on-secondary py-3.5 rounded-xl transition-all font-label-md text-label-md font-bold text-center shadow-sm"
              >
                <span className="material-symbols-outlined text-xl">chat</span>
                Tanya Penjual
              </Link>
              {product.isAuction ? (
                <button
                  disabled
                  className="flex-1 bg-amber-500/10 text-amber-700 border border-amber-200/50 py-3.5 rounded-xl font-label-md text-label-md font-bold text-center cursor-default"
                >
                  Sistem Lelang Aktif
                </button>
              ) : product.status === "ACTIVE" ? (
                <Link
                  href={`/marketplace/${product.id}/transaksi`}
                  className="flex-1 flex justify-center items-center gap-2 bg-primary text-on-primary hover:bg-primary-container py-3.5 rounded-xl transition-colors font-label-md text-label-md font-bold text-center shadow-sm"
                >
                  <span className="material-symbols-outlined text-xl">where_to_vote</span>
                  {product.isService ? "Pesan Jasa / Bimbingan" : "Ajukan COD"}
                </Link>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-surface-container-highest text-on-surface-variant py-3.5 rounded-xl font-label-md text-label-md font-bold text-center cursor-not-allowed"
                >
                  Barang Tidak Tersedia
                </button>
              )}
            </div>

            <ModerationButtons
              productId={product.id}
              sellerId={product.sellerId}
              sellerName={product.seller.name}
              isBlocked={!!isBlocked}
              currentUser={user}
            />
          </div>
        </div>

        <div className="mt-12 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/30">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">reviews</span>
            Ulasan Pengguna ({product.reviews.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {product.reviews.length === 0 ? (
                <p className="text-on-surface-variant text-sm py-4">Belum ada ulasan untuk barang ini.</p>
              ) : (
                <div className="divide-y divide-outline-variant/20 space-y-6">
                  {product.reviews.map((rev, idx) => (
                    <div key={rev.id} className={idx > 0 ? "pt-6" : ""}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shadow-inner">
                            {rev.user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-title-md text-sm font-bold text-on-surface">{rev.user.name}</h4>
                            <p className="text-[10px] text-on-surface-variant/70">
                              {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed pl-11">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 h-fit shadow-sm">
              <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-3">
                Tulis Ulasan Anda
              </h3>
              {canReview ? (
                <form action={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="rating">
                      Rating Barang
                    </label>
                    <select
                      id="rating"
                      name="rating"
                      className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-sm"
                      required
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Sangat Puas)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Puas)</option>
                      <option value="3">⭐⭐⭐ (3 - Biasa Saja)</option>
                      <option value="2">⭐⭐ (2 - Kurang)</option>
                      <option value="1">⭐ (1 - Kecewa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="comment">
                      Komentar / Ulasan
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows={4}
                      placeholder="Bagikan pengalaman transaksi Anda dan kondisi fisik barang setelah COD."
                      className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-sm resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary hover:bg-primary-container py-3 rounded-xl transition-colors font-bold text-sm cursor-pointer shadow-sm"
                  >
                    Kirim Ulasan
                  </button>
                </form>
              ) : (
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {user
                    ? "Anda hanya dapat memberikan ulasan jika telah berhasil melakukan transaksi COD (status selesai) untuk produk ini."
                    : "Silakan login terlebih dahulu untuk memberikan ulasan barang."}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
