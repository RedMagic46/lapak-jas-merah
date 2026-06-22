import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteProduct, sundulProductAction } from "@/app/actions/products";
import ProductFormModal from "./ProductFormModal";
import { revalidatePath } from "next/cache";
import { PRODUCT_CATEGORIES } from "@/lib/helpers";

interface PageProps {
  searchParams: Promise<{ add?: string; edit?: string }>;
}

export default async function SellerProductsPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const { add, edit } = await searchParams;

  const products = await prisma.product.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      category: true,
      imageUrl: true,
      status: true,
      createdAt: true,
    }
  });

  const categories = [...PRODUCT_CATEGORIES];



  async function handleDelete(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    await deleteProduct(productId);
    revalidatePath("/seller/products");
  }

  async function handleSundul(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    await sundulProductAction(productId);
    revalidatePath("/seller/products");
  }

  let editProduct = null;
  if (edit) {
    editProduct = await prisma.product.findUnique({
      where: { id: edit }
    });
  }

  return (
    <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
              Manajemen Produk Saya
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Kelola iklan barang, tambah produk baru, atau sundul iklan produk agar tampil di atas.
            </p>
          </div>
          <Link
            href="/seller/products?add=true"
            className="flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm font-bold"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Tambah Produk
          </Link>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="p-16 text-center text-on-surface-variant/65 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl mb-3 text-on-surface-variant/30">
                  inventory
                </span>
                <p className="font-bold mb-1">Belum Ada Produk Terdaftar</p>
                <p className="text-sm max-w-sm">Mulai jual buku, jas lab, atau gadget bekas Anda dengan menekan tombol &quot;Tambah Produk&quot;.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                    <th className="py-3 px-4">Info Produk</th>
                    <th className="py-3 px-4">Harga</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={product.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=50"}
                          alt={product.title}
                          className="w-12 h-12 rounded object-cover border border-outline-variant/30"
                        />
                        <div>
                          <p className="font-semibold text-primary">{product.title}</p>
                          <p className="text-[11px] text-on-surface-variant">Dibuat: {new Date(product.createdAt).toLocaleDateString("id-ID")}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-on-surface">
                        Rp {product.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-surface-container text-on-surface-variant text-xs px-2.5 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : product.status === "SOLD"
                              ? "bg-tertiary-fixed text-on-tertiary-fixed"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <form action={handleSundul}>
                            <input type="hidden" name="productId" value={product.id} />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded hover:opacity-90 font-bold transition-opacity text-xs cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Sundul agar produk kembali di posisi teratas"
                            >
                              <span className="material-symbols-outlined text-xs">rocket_launch</span>
                              Sundul
                            </button>
                          </form>

                          <Link
                            href={`/seller/products?edit=${product.id}`}
                            className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            title="Edit Produk"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </Link>

                          <form action={handleDelete}>
                            <input type="hidden" name="productId" value={product.id} />
                            <button
                              type="submit"
                              className="p-1 rounded text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {add && (
          <ProductFormModal
            mode="add"
            categories={categories}
          />
        )}

        {edit && editProduct && (
          <ProductFormModal
            mode="edit"
            product={editProduct}
            categories={categories}
          />
        )}
      </main>
  );
}
