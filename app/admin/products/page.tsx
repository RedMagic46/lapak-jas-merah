import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateProduct } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminProductsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { seller: true }
  });

  async function handleModerate(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    const status = formData.get("status") as string;
    await moderateProduct(productId, status);
    revalidatePath("/admin/products");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Inventaris &amp; Moderasi Produk
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Daftar seluruh barang yang diiklankan oleh mahasiswa UMM. Anda dapat menghapus atau menandai barang (Flagged) jika terbukti palsu atau spam.
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Penjual</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Fakultas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderasi</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.imageUrl || ""}
                        alt="Product Image"
                        className="w-10 h-10 rounded object-cover border border-outline-variant/35"
                      />
                      <div>
                        <p className="font-semibold text-primary">{p.title}</p>
                        <p className="text-[10px] text-on-surface-variant">ID: {p.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">{p.seller.name}</td>
                    <td className="py-3 px-4 font-bold text-xs">Rp {p.price.toLocaleString("id-ID")}</td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant">{p.category}</td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant">{p.faculty || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        p.status === "ACTIVE" ? "bg-green-100 text-green-800" : p.status === "SOLD" ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-error-container text-on-error-container"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status !== "FLAGGED" ? (
                        <form action={handleModerate}>
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="status" value="FLAGGED" />
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-error-container text-error rounded hover:bg-error hover:text-on-error transition-colors text-xs font-bold cursor-pointer"
                          >
                            Flag / Hapus
                          </button>
                        </form>
                      ) : (
                        <form action={handleModerate}>
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="status" value="ACTIVE" />
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded hover:bg-surface-container-high transition-colors text-xs font-bold cursor-pointer"
                          >
                            Aktifkan Kembali
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
