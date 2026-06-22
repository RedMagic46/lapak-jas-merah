import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleProductPromotion } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminPromotionsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { seller: true }
  });

  async function handleToggle(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    const isPromoted = formData.get("isPromoted") === "true";
    await toggleProductPromotion(productId, !isPromoted);
    revalidatePath("/admin/promotions");
  }

  return (
    <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Promosi &amp; Sponsor Iklan
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sponsori produk mahasiswa agar selalu berada di baris rekomendasi teratas beranda utama.
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                  <th className="py-3 px-4">Info Produk</th>
                  <th className="py-3 px-4">Penjual</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Status Promosi</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.imageUrl || ""}
                        alt="Product Image"
                        className="w-10 h-10 rounded object-cover border border-outline-variant/30"
                      />
                      <div>
                        <p className="font-semibold text-primary">{p.title}</p>
                        <p className="text-[10px] text-on-surface-variant">Kategori: {p.category}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-on-surface-variant">{p.seller.name}</td>
                    <td className="py-3 px-4 font-bold text-xs">Rp {p.price.toLocaleString("id-ID")}</td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant">{p.category}</td>
                    <td className="py-3 px-4">
                      {p.isPromoted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-container text-on-primary-container">
                          SPONSORED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-surface-container text-on-surface-variant">
                          REGULER
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <form action={handleToggle}>
                        <input type="hidden" name="productId" value={p.id} />
                        <input type="hidden" name="isPromoted" value={p.isPromoted ? "true" : "false"} />
                        <button
                          type="submit"
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            p.isPromoted
                              ? "bg-outline text-white hover:bg-outline-variant"
                              : "bg-primary text-on-primary hover:bg-primary-container"
                          }`}
                        >
                          {p.isPromoted ? "Hentikan Promosi" : "Sponsori Iklan"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
  );
}
