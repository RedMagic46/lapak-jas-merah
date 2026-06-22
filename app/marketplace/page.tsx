import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { toggleWishlist } from "@/app/actions/products";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { PRODUCT_CATEGORIES } from "@/lib/helpers";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

interface SearchParams {
  search?: string;
  category?: string;
  sort?: string;
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const user = await getAuthUser();

  const searchQuery = params.search || "";
  const categoryQuery = params.category || "";
  const sortQuery = params.sort || "newest";

  const whereClause: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (categoryQuery) {
    whereClause.category = categoryQuery;
  }

  let orderByClause: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sortQuery === "cheapest") {
    orderByClause = { price: "asc" };
  } else if (sortQuery === "popular") {
    orderByClause = { transactions: { _count: "desc" } };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    take: 100,
    include: {
      seller: true,
      wishlists: {
        where: {
          userId: user?.id || "",
        },
      },
    },
  });

  const categories = PRODUCT_CATEGORIES;

  async function handleToggleWishlist(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    await toggleWishlist(productId);
    revalidatePath("/marketplace");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-lg">
      <Navbar />

      <div className="flex flex-1 max-w-[1440px] mx-auto w-full pt-8 px-container-margin md:px-[80px]">
        <aside className="w-64 shrink-0 pr-8 hidden lg:block">
          <div className="sticky top-24 bg-surface-container-low rounded-xl p-card-padding shadow-sm border border-outline-variant/30">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-4 font-bold">Kategori</h3>
            <ul className="space-y-3 mb-8">
              <li>
                <Link
                  href="/marketplace"
                  className={`flex items-center gap-2 font-body-md text-body-md transition-colors ${
                    !categoryQuery ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Semua Kategori
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/marketplace?category=${encodeURIComponent(cat)}${searchQuery ? `&search=${searchQuery}` : ""}`}
                    className={`flex items-center gap-2 font-body-md text-body-md transition-colors ${
                      categoryQuery === cat ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-title-lg text-title-lg text-on-surface mb-4 font-bold">Urutkan</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/marketplace?sort=newest${categoryQuery ? `&category=${categoryQuery}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                  className={`flex items-center gap-2 font-body-md text-body-md transition-colors ${
                    sortQuery === "newest" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Terbaru
                </Link>
              </li>
              <li>
                <Link
                  href={`/marketplace?sort=cheapest${categoryQuery ? `&category=${categoryQuery}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                  className={`flex items-center gap-2 font-body-md text-body-md transition-colors ${
                    sortQuery === "cheapest" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Termurah
                </Link>
              </li>
              <li>
                <Link
                  href={`/marketplace?sort=popular${categoryQuery ? `&category=${categoryQuery}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                  className={`flex items-center gap-2 font-body-md text-body-md transition-colors ${
                    sortQuery === "popular" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Terpopuler
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        <main className="flex-1 pb-section-gap">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="font-headline-lg text-headline-lg md:text-headline-lg-mobile text-on-surface font-bold leading-tight">
                Jelajahi Marketplace
              </h1>
              {searchQuery && (
                <p className="text-on-surface-variant text-sm mt-1">
                  Hasil pencarian untuk &quot;<span className="font-bold text-primary">{searchQuery}</span>&quot;
                </p>
              )}
            </div>
            <Link
              href="/marketplace/requests"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-sm">campaign</span>
              Papan Permintaan (WTB)
            </Link>

            <div className="relative group lg:hidden">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface hover:bg-surface-container-high transition-colors font-semibold">
                Urutkan
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg shadow-lg border border-outline-variant hidden group-hover:block z-10">
                <ul className="py-1">
                  <li>
                    <Link
                      className="block px-4 py-2 font-body-md text-body-md text-on-surface hover:bg-primary-container/10 hover:text-primary transition-colors"
                      href={`/marketplace?sort=newest`}
                    >
                      Terbaru
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="block px-4 py-2 font-body-md text-body-md text-on-surface hover:bg-primary-container/10 hover:text-primary transition-colors"
                      href={`/marketplace?sort=cheapest`}
                    >
                      Termurah
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">
                inventory_2
              </span>
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-2">
                Tidak Ada Produk Ditemukan
              </h3>
              <p className="text-on-surface-variant max-w-md">
                Kami tidak dapat menemukan produk yang cocok dengan pencarian Anda. Silakan coba gunakan kata kunci yang berbeda.
              </p>
              <Link href="/marketplace" className="mt-6 px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity font-semibold">
                Reset Pencarian
              </Link>
            </div>
          ) : (

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
              {products.map((product) => {
                const isWished = product.wishlists.length > 0;
                return (
                  <div
                    key={product.id}
                    className="bg-surface rounded-[16px] p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-200 group border border-outline-variant/30 flex flex-col h-full relative"
                  >
                    <div className="relative w-full aspect-square rounded-[12px] overflow-hidden mb-4 bg-surface-container-highest">
                      <Link href={`/marketplace/${product.id}`} className="block w-full h-full">
                        {product.imageUrl && (
                          <img
                            alt={product.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            src={product.imageUrl}
                          />
                        )}
                      </Link>

                      {product.transactionType === "DONATION" && (
                        <span className="absolute top-2 left-2 z-10 text-[10px] bg-tertiary text-on-tertiary px-2 py-0.5 rounded-md font-bold uppercase shadow-sm">
                          Donasi
                        </span>
                      )}
                      {product.transactionType === "BARTER" && (
                        <span className="absolute top-2 left-2 z-10 text-[10px] bg-secondary text-on-secondary px-2 py-0.5 rounded-md font-bold uppercase shadow-sm">
                          Barter
                        </span>
                      )}
                      {product.isAuction && (
                        <span className="absolute top-2 left-2 z-10 text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-md font-bold uppercase shadow-sm">
                          Lelang
                        </span>
                      )}
                      {product.isService && (
                        <span className="absolute top-2 left-2 z-10 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-md font-bold uppercase shadow-sm">
                          Jasa
                        </span>
                      )}

                      <form action={handleToggleWishlist} className="absolute top-2 right-2 z-10">
                        <input type="hidden" name="productId" value={product.id} />
                        <button
                          type="submit"
                          className="p-1.5 bg-surface/80 backdrop-blur-md rounded-full text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                        >
                          <span
                            className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: isWished ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>
                      </form>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <Link href={`/marketplace/${product.id}`} className="block flex-1 flex flex-col">
                        <h3 className="font-title-lg text-title-lg text-on-surface line-clamp-2 mb-2 font-medium hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <div className="mt-auto">
                          <div className="font-display-lg text-headline-md text-primary mb-2 font-bold text-base md:text-lg">
                            {product.isAuction ? (
                              <span className="text-amber-600">
                                {product.currentBid > 0
                                  ? `Bid: Rp ${product.currentBid.toLocaleString("id-ID")}`
                                  : `Mulai: Rp ${product.startingBid.toLocaleString("id-ID")}`}
                              </span>
                            ) : product.transactionType === "DONATION" ? (
                              <span className="text-tertiary">Gratis (Donasi)</span>
                            ) : product.transactionType === "BARTER" ? (
                              <span className="text-secondary">Barter / Swap</span>
                            ) : (
                              `Rp ${product.price.toLocaleString("id-ID")}`
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              {product.category}
                            </span>
                            {product.seller.isVerified && (
                              <div className="flex items-center gap-0.5 text-on-surface-variant text-xs">
                                <span className="material-symbols-outlined text-sm text-tertiary">
                                  verified
                                </span>
                                <span className="truncate max-w-[60px]">{product.seller.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}
