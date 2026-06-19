import Link from "next/link";
import { redirect } from "next/navigation";
import SellerSidebar from "@/components/SellerSidebar";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTransactionStatus } from "@/app/actions/transactions";
import { revalidatePath } from "next/cache";

export default async function SellerDashboardPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const [productsCount, transactions] = await Promise.all([
    prisma.product.count({
      where: { sellerId: user.id, status: "ACTIVE" }
    }),
    prisma.transaction.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        buyer: true,
        product: true,
      }
    })
  ]);

  const pendingOrdersCount = transactions.filter(t => t.status === "PENDING").length;
  const completedTransactions = transactions.filter(t => t.status === "COMPLETED");
  const totalEarnings = completedTransactions.reduce((acc, t) => acc + t.product.price, 0);

  async function handleUpdateStatus(formData: FormData) {
    "use server";
    const txId = formData.get("txId") as string;
    const status = formData.get("status") as string;
    await updateTransactionStatus(txId, status);
    revalidatePath("/seller");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <SellerSidebar />

      <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1 font-bold">
              Seller Dashboard
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Selamat datang kembali, <span className="font-bold text-primary">{user.name}</span>. Kelola tokomu di sini.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/seller/settings"
              className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full shadow-sm border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="font-label-md text-label-md text-on-surface hidden sm:block">
                {user.name}
              </span>
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-primary-container/10 text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-1 rounded-full font-bold">
                Earning
              </span>
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1 text-xs">Total Pendapatan</p>
              <h3 className="font-display-lg text-headline-lg text-on-surface font-bold">
                Rp {totalEarnings.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-tertiary-container/20 text-tertiary">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary bg-primary-container/10 px-2 py-1 rounded-full font-bold">
                Aktif
              </span>
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1 text-xs">Barang Aktif</p>
              <h3 className="font-display-lg text-headline-lg text-on-surface font-bold">
                {productsCount} Listings
              </h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-error-container/30 text-error">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="font-label-sm text-label-sm text-error bg-error-container/20 px-2 py-1 rounded-full font-bold">
                  Butuh Tindakan
                </span>
              )}
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1 text-xs">Pengajuan COD Baru</p>
              <h3 className="font-display-lg text-headline-lg text-on-surface font-bold">
                {pendingOrdersCount} Pesanan
              </h3>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden">
          <div className="p-card-padding border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Daftar Pengajuan COD</h3>
            <Link href="/seller/orders" className="text-primary font-label-md text-label-md hover:underline font-bold">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant/65">
                Belum ada pengajuan transaksi COD yang masuk ke toko Anda.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                    <th className="py-3 px-4">Barang / Pembeli</th>
                    <th className="py-3 px-4">Lokasi COD</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={tx.product.imageUrl || ""}
                          alt="Product"
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-semibold text-primary">{tx.product.title}</p>
                          <p className="text-[11px] text-on-surface-variant">Pembeli: {tx.buyer.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-xs text-on-surface-variant max-w-[200px] truncate">
                        {tx.meetupLocation}
                      </td>
                      <td className="py-3 px-4 text-xs text-on-surface-variant">
                        {tx.meetupTime ? new Date(tx.meetupTime).toLocaleString("id-ID") : "Kesepakatan chat"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.status === "PENDING"
                              ? "bg-surface-variant text-on-surface-variant"
                              : tx.status === "ACCEPTED"
                              ? "bg-secondary-container text-on-secondary-container"
                              : tx.status === "COMPLETED"
                              ? "bg-tertiary-fixed text-on-tertiary-fixed"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.status === "PENDING" && (
                          <div className="flex justify-end gap-2">
                            <form action={handleUpdateStatus}>
                              <input type="hidden" name="txId" value={tx.id} />
                              <input type="hidden" name="status" value="CANCELLED" />
                              <button
                                type="submit"
                                className="w-8 h-8 flex items-center justify-center rounded bg-error-container text-error hover:bg-error hover:text-on-error transition-colors cursor-pointer"
                                title="Tolak"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </form>
                            <form action={handleUpdateStatus}>
                              <input type="hidden" name="txId" value={tx.id} />
                              <input type="hidden" name="status" value="ACCEPTED" />
                              <button
                                type="submit"
                                className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer"
                                title="Terima"
                              >
                                <span className="material-symbols-outlined text-sm">check</span>
                              </button>
                            </form>
                          </div>
                        )}
                        {tx.status === "ACCEPTED" && (
                          <form action={handleUpdateStatus}>
                            <input type="hidden" name="txId" value={tx.id} />
                            <input type="hidden" name="status" value="COMPLETED" />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-tertiary text-on-tertiary rounded hover:opacity-90 font-semibold transition-opacity text-xs cursor-pointer"
                            >
                              Selesaikan COD
                            </button>
                          </form>
                        )}
                        {tx.status === "COMPLETED" && (
                          <span className="text-xs text-on-surface-variant font-bold">Selesai</span>
                        )}
                        {tx.status === "CANCELLED" && (
                          <span className="text-xs text-error font-bold">Batal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
