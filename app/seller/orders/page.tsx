import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTransactionStatus } from "@/app/actions/transactions";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function SellerOrdersPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const { status } = await searchParams;

  const whereClause: Prisma.TransactionWhereInput = { sellerId: user.id };
  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      meetupLocation: true,
      meetupTime: true,
      notes: true,
      productId: true,
      buyer: {
        select: {
          id: true,
          name: true,
          nim: true,
        }
      },
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrl: true,
        }
      }
    }
  });

  async function handleStatusChange(formData: FormData) {
    "use server";
    const txId = formData.get("txId") as string;
    const newStatus = formData.get("status") as string;
    await updateTransactionStatus(txId, newStatus);
    revalidatePath("/seller/orders");
  }

  const tabs = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu", value: "PENDING" },
    { label: "Disetujui", value: "ACCEPTED" },
    { label: "Selesai", value: "COMPLETED" },
    { label: "Batal", value: "CANCELLED" },
  ];

  const currentTab = status || "ALL";

  return (
    <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Daftar Pesanan &amp; Transaksi COD
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Konfirmasi pengajuan COD, atur waktu pertemuan nugas, atau tandai transaksi sebagai selesai.
          </p>
        </header>

        <div className="flex gap-2 border-b border-outline-variant/35 mb-6 overflow-x-auto pb-2 shrink-0">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/seller/orders?status=${tab.value}`}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === tab.value
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-16 text-center text-on-surface-variant/65">
              <span className="material-symbols-outlined text-5xl mb-2 text-on-surface-variant/30">
                shopping_cart
              </span>
              <p className="font-bold">Tidak Ada Pesanan Ditemukan</p>
              <p className="text-sm">Saat ini tidak ada data pengajuan transaksi dalam status ini.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={tx.product.imageUrl || ""}
                    alt="Product"
                    className="w-16 h-16 rounded object-cover border border-outline-variant/30 shrink-0"
                  />
                  <div>
                    <span
                      className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 ${
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
                    <h3 className="font-title-lg text-body-lg font-bold text-on-surface leading-tight">
                      {tx.product.title}
                    </h3>
                    <p className="text-primary font-bold text-sm mt-0.5">
                      Rp {tx.product.price.toLocaleString("id-ID")}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-on-surface-variant leading-relaxed">
                      <p>
                        <span className="font-semibold text-on-surface">Pembeli:</span> {tx.buyer.name} (NIM: {tx.buyer.nim || "-"})
                      </p>
                      <p>
                        <span className="font-semibold text-on-surface">Lokasi COD:</span> {tx.meetupLocation}
                      </p>
                      <p>
                        <span className="font-semibold text-on-surface">Waktu:</span>{" "}
                        {tx.meetupTime ? new Date(tx.meetupTime).toLocaleString("id-ID") : "Nego di chat"}
                      </p>
                      {tx.notes && (
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-on-surface">Catatan:</span> &quot;{tx.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 md:flex-col shrink-0">
                  {tx.status === "PENDING" && (
                    <>
                      <form action={handleStatusChange} className="w-full">
                        <input type="hidden" name="txId" value={tx.id} />
                        <input type="hidden" name="status" value="ACCEPTED" />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer text-center"
                        >
                          Terima COD
                        </button>
                      </form>
                      <form action={handleStatusChange} className="w-full">
                        <input type="hidden" name="txId" value={tx.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Tolak Tawaran
                        </button>
                      </form>
                    </>
                  )}

                  {tx.status === "ACCEPTED" && (
                    <>
                      <form action={handleStatusChange} className="w-full">
                        <input type="hidden" name="txId" value={tx.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-tertiary text-on-tertiary rounded-lg text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer text-center"
                        >
                          Selesaikan Transaksi
                        </button>
                      </form>
                      <form action={handleStatusChange} className="w-full">
                        <input type="hidden" name="txId" value={tx.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Batalkan Transaksi
                        </button>
                      </form>
                    </>
                  )}

                  <Link
                    href={`/chat?partnerId=${tx.buyer.id}&productId=${tx.productId}`}
                    className="px-4 py-2 border border-secondary text-secondary hover:bg-secondary/5 rounded-lg text-xs font-bold transition-colors text-center"
                  >
                    Hubungi Pembeli
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
  );
}
