import Link from "next/link";
import { redirect } from "next/navigation";
import SellerSidebar from "@/components/SellerSidebar";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProduct, updateProduct, deleteProduct, sundulProductAction } from "@/app/actions/products";
import { revalidatePath } from "next/cache";

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
    orderBy: { createdAt: "desc" }
  });

  const categories = ["Buku Kuliah", "Jas Lab", "Elektronik", "Kost", "Tutor Sebaya", "Lelang Cepat"];

  async function handleCreate(formData: FormData) {
    "use server";
    const res = await createProduct(formData);
    if (res.success) {
      redirect("/seller/products");
    }
  }

  async function handleEdit(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    const res = await updateProduct(productId, formData);
    if (res.success) {
      redirect("/seller/products");
    }
  }

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
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <SellerSidebar />

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
          <div className="fixed inset-0 bg-black/55 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-outline-variant/35 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Tambah Produk Baru</h3>
                <Link href="/seller/products" className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </Link>
              </div>
              <form action={handleCreate} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="title">
                    Nama / Judul Barang
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    type="text"
                    placeholder="Contoh: Buku Kalkulus Purcell Jilid 1"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                 <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="price">
                    Harga (Rp) (Opsional jika Lelang)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Masukkan nominal angka saja, misal: 75000"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <input
                      id="isAuction"
                      name="isAuction"
                      type="checkbox"
                      value="true"
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <label htmlFor="isAuction" className="text-xs font-semibold text-on-surface cursor-pointer">
                      Jadikan Lelang
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="isService"
                      name="isService"
                      type="checkbox"
                      value="true"
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <label htmlFor="isService" className="text-xs font-semibold text-on-surface cursor-pointer">
                      Jasa / Tutor
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="startingBid">
                    Harga Mulai Lelang (Wajib jika Lelang)
                  </label>
                  <input
                    id="startingBid"
                    name="startingBid"
                    type="number"
                    placeholder="Contoh: 50000"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="auctionEnds">
                    Waktu Selesai Lelang (Wajib jika Lelang)
                  </label>
                  <input
                    id="auctionEnds"
                    name="auctionEnds"
                    type="datetime-local"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="category">
                    Kategori
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="faculty">
                    Rekomendasi Fakultas (Opsional)
                  </label>
                  <input
                    id="faculty"
                    name="faculty"
                    type="text"
                    placeholder="Contoh: FEB, FT, Fikes, dll."
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="imageUrl">
                    URL Foto Produk (Opsional)
                  </label>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="text"
                    placeholder="Masukkan link gambar (Unsplash, Imgur, dll.)"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="description">
                    Deskripsi Detail
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    placeholder="Jelaskan kondisi barang Anda (ada coretan/tidak, ukuran, kelengkapan, dll.)"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                  ></textarea>
                </div>
                <div className="pt-4 flex gap-3 border-t border-outline-variant/30">
                  <Link
                    href="/seller/products"
                    className="flex-1 text-center py-2.5 border border-outline rounded-lg text-on-surface-variant hover:bg-surface-container font-semibold transition-colors"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 font-bold transition-opacity shadow-sm"
                  >
                    Simpan Iklan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {edit && editProduct && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-outline-variant/35 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Edit Produk</h3>
                <Link href="/seller/products" className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </Link>
              </div>
              <form action={handleEdit} className="p-6 overflow-y-auto space-y-4">
                <input type="hidden" name="productId" value={editProduct.id} />
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-title">
                    Nama / Judul Barang
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    required
                    defaultValue={editProduct.title}
                    type="text"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-price">
                    Harga (Rp) (Opsional jika Lelang)
                  </label>
                  <input
                    id="edit-price"
                    name="price"
                    defaultValue={editProduct.price}
                    type="number"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <input
                      id="edit-isAuction"
                      name="isAuction"
                      type="checkbox"
                      value="true"
                      defaultChecked={editProduct.isAuction}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <label htmlFor="edit-isAuction" className="text-xs font-semibold text-on-surface cursor-pointer">
                      Jadikan Lelang
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="edit-isService"
                      name="isService"
                      type="checkbox"
                      value="true"
                      defaultChecked={editProduct.isService}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <label htmlFor="edit-isService" className="text-xs font-semibold text-on-surface cursor-pointer">
                      Jasa / Tutor
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-startingBid">
                    Harga Mulai Lelang (Wajib jika Lelang)
                  </label>
                  <input
                    id="edit-startingBid"
                    name="startingBid"
                    defaultValue={editProduct.startingBid}
                    type="number"
                    placeholder="Contoh: 50000"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-auctionEnds">
                    Waktu Selesai Lelang (Wajib jika Lelang)
                  </label>
                  <input
                    id="edit-auctionEnds"
                    name="auctionEnds"
                    defaultValue={editProduct.auctionEnds ? new Date(editProduct.auctionEnds.getTime() - editProduct.auctionEnds.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    type="datetime-local"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-category">
                    Kategori
                  </label>
                  <select
                    id="edit-category"
                    name="category"
                    required
                    defaultValue={editProduct.category}
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-faculty">
                    Rekomendasi Fakultas (Opsional)
                  </label>
                  <input
                    id="edit-faculty"
                    name="faculty"
                    defaultValue={editProduct.faculty || ""}
                    type="text"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-imageUrl">
                    URL Foto Produk (Opsional)
                  </label>
                  <input
                    id="edit-imageUrl"
                    name="imageUrl"
                    defaultValue={editProduct.imageUrl || ""}
                    type="text"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="edit-description">
                    Deskripsi Detail
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    required
                    rows={4}
                    defaultValue={editProduct.description}
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                  ></textarea>
                </div>
                <div className="pt-4 flex gap-3 border-t border-outline-variant/30">
                  <Link
                    href="/seller/products"
                    className="flex-1 text-center py-2.5 border border-outline rounded-lg text-on-surface-variant hover:bg-surface-container font-semibold transition-colors"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 font-bold transition-opacity shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
