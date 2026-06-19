import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createItemRequest, deleteItemRequest } from "@/app/actions/requests";
import { revalidatePath } from "next/cache";

export default async function RequestBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await getAuthUser();
  const params = await searchParams;
  const activeType = params.type || "ALL";

  const requests = await prisma.itemRequest.findMany({
    where: activeType !== "ALL" ? { category: activeType } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: true },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    const res = await createItemRequest(formData);
    if (res.success) {
      revalidatePath("/marketplace/requests");
    }
  }

  async function handleDelete(id: string) {
    "use server";
    await deleteItemRequest(id);
    revalidatePath("/marketplace/requests");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-lg">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full pt-8 px-container-margin md:px-[80px] pb-section-gap">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
              Papan Permintaan & Jastip
            </h1>
            <p className="text-on-surface-variant text-body-md">
              Cari barang yang Anda butuhkan (WTB) atau tawarkan jasa titip khusus civitas akademika UMM.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center text-primary font-bold hover:underline"
          >
            <span className="material-symbols-outlined mr-1 text-sm">storefront</span>
            Kembali ke Pasar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 h-fit shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="font-title-lg text-title-lg font-bold text-on-surface mb-4">
              Buat Permintaan Baru
            </h2>
            {!user ? (
              <div className="p-4 bg-surface-container-high rounded-xl text-center">
                <p className="text-sm text-on-surface-variant mb-3">Silakan login untuk memposting permintaan.</p>
                <Link href="/login" className="inline-block bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold">
                  Masuk Ke Akun
                </Link>
              </div>
            ) : (
              <form action={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="category">
                    Kategori Permintaan
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-sm"
                    required
                  >
                    <option value="WTB">Cari Barang (Want To Buy)</option>
                    <option value="JASTIP">Jasa Titip (Jastip)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="title">
                    Nama Barang / Jastip
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Contoh: Jas Almamater UMM L, Jastip Warung Pojok"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="budget">
                    Estimasi Anggaran / Upah (Rp)
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="Contoh: 120000"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="description">
                    Deskripsi Kebutuhan
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Sebutkan detail barang, ukuran, kondisi, atau lokasi jastip yang diinginkan."
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-sm resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary hover:bg-primary-container py-3 rounded-xl transition-colors font-bold text-sm cursor-pointer shadow-sm"
                >
                  Kirim Postingan
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 border-b border-outline-variant/30 pb-4">
              <Link
                href="/marketplace/requests"
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeType === "ALL"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                Semua ({requests.length})
              </Link>
              <Link
                href="/marketplace/requests?type=WTB"
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeType === "WTB"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                Cari Barang (WTB)
              </Link>
              <Link
                href="/marketplace/requests?type=JASTIP"
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeType === "JASTIP"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                Jasa Titip (Jastip)
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-8">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">
                  campaign
                </span>
                <p className="text-on-surface-variant font-semibold">Belum ada permintaan barang saat ini.</p>
                <p className="text-xs text-on-surface-variant/60">Jadilah yang pertama memposting di papan permintaan!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            req.category === "WTB"
                              ? "bg-tertiary/10 text-tertiary"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {req.category === "WTB" ? "CARI BARANG" : "JASA TITIP"}
                        </span>
                        <span className="text-xs text-on-surface-variant/70">
                          {new Date(req.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-2">
                        {req.title}
                      </h3>

                      <div className="text-primary font-display-md text-base font-bold mb-3">
                        Budget: Rp {req.budget.toLocaleString("id-ID")}
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                          {req.author.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{req.author.name}</p>
                          <p className="text-[10px] text-on-surface-variant">NIM {req.author.nim || "-"}</p>
                        </div>
                      </div>

                      {user && (user.id === req.authorId || user.role === "ADMIN") ? (
                        <form action={handleDelete.bind(null, req.id)}>
                          <button
                            type="submit"
                            className="p-1.5 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-lg transition-colors cursor-pointer"
                            title="Hapus Postingan"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </form>
                      ) : (
                        user && (
                          <Link
                            href={`/chat?partnerId=${req.authorId}`}
                            className="bg-secondary text-on-secondary px-3 py-1 rounded-lg text-xs font-bold hover:bg-secondary-container transition-colors"
                          >
                            Hubungi
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
