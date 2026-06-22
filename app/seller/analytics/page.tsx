import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SellerAnalyticsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      name: d.toLocaleString("id-ID", { month: "short" }),
    };
  }).reverse();

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 5);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const [
    products,
    completedTransactions,
    sellerTransactionsLast6Months,
    totalReceivedMessages,
    readReceivedMessages,
    reviews
  ] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: user.id },
      select: { status: true }
    }),
    prisma.transaction.findMany({
      where: { sellerId: user.id, status: "COMPLETED" },
      select: {
        product: {
          select: { price: true }
        }
      }
    }),
    prisma.transaction.findMany({
      where: {
        sellerId: user.id,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.message.count({
      where: { receiverId: user.id }
    }),
    prisma.message.count({
      where: { receiverId: user.id, isRead: true }
    }),
    prisma.review.findMany({
      where: {
        product: {
          sellerId: user.id
        }
      },
      select: {
        rating: true
      }
    })
  ]);

  const activeCount = products.filter(p => p.status === "ACTIVE").length;
  const soldCount = products.filter(p => p.status === "SOLD").length;
  const totalEarnings = completedTransactions.reduce((acc, t) => acc + t.product.price, 0);

  const transactionCounts = last6Months.map((m) => {
    const count = sellerTransactionsLast6Months.filter((t) => {
      const date = new Date(t.createdAt);
      return date.getMonth() === m.month && date.getFullYear() === m.year;
    }).length;
    return {
      name: m.name,
      count,
    };
  });

  const maxCount = Math.max(...transactionCounts.map((tc) => tc.count), 1);
  const responseRate = totalReceivedMessages > 0 ? Math.round((readReceivedMessages / totalReceivedMessages) * 100) : 100;
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5.0;
  const descriptionMatch = Math.round((averageRating / 5) * 100);
  const codPunctuality = reviews.length > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100) : 100;

  return (
    <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Analitik Penjualan Toko
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Pantau performa penjualan, total pendapatan, dan statistik barang yang Anda iklankan.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm">
            <span className="text-xs text-on-surface-variant font-bold">Total Pendapatan</span>
            <h3 className="text-2xl font-bold text-primary mt-2">
              Rp {totalEarnings.toLocaleString("id-ID")}
            </h3>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              Pendapatan COD Terkini
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm">
            <span className="text-xs text-on-surface-variant font-bold">Produk Terjual</span>
            <h3 className="text-2xl font-bold text-on-surface mt-2">{soldCount} Barang</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Dari total {products.length} iklan terdaftar
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm">
            <span className="text-xs text-on-surface-variant font-bold">Produk Aktif</span>
            <h3 className="text-2xl font-bold text-on-surface mt-2">{activeCount} Iklan</h3>
            <p className="text-xs text-on-surface-variant mt-1">Tampil di halaman pencarian mahasiswa</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-8">
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/20 h-[350px] flex flex-col">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 font-bold">Statistik Transaksi Toko</h3>
            <div className="flex-1 flex items-end justify-between gap-2 pt-4 border-b border-surface-variant pb-2 relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant -ml-6">
                <span>{maxCount}</span>
                <span>{Math.round(maxCount * 0.75)}</span>
                <span>{Math.round(maxCount * 0.5)}</span>
                <span>{Math.round(maxCount * 0.25)}</span>
                <span>0</span>
              </div>
              {transactionCounts.map((tc, idx) => {
                const heightPercent = `${(tc.count / maxCount) * 100}%`;
                return (
                  <div
                    key={idx}
                    style={{ height: heightPercent }}
                    className="w-full bg-primary/40 rounded-t-sm hover:bg-primary transition-colors relative group cursor-pointer min-h-[4px]"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-10">
                      {tc.count} Tx
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-label-md">
              {transactionCounts.map((tc, idx) => (
                <span key={idx}>{tc.name}</span>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/20 h-[350px] flex flex-col justify-between">
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-4">Metrik Kepuasan Pembeli</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Kecepatan Respon Chat</span>
                  <span>{responseRate}% ({responseRate >= 80 ? "Sangat Cepat" : "Standar"})</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${responseRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Kesesuaian Deskripsi Barang</span>
                  <span>{descriptionMatch}% ({descriptionMatch >= 80 ? "Sangat Sesuai" : "Cukup Sesuai"})</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: `${descriptionMatch}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Ketepatan Waktu COD</span>
                  <span>{codPunctuality}% ({codPunctuality >= 80 ? "Tepat Waktu" : "Cukup Tepat"})</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: `${codPunctuality}%` }}></div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant/85 italic leading-normal">
              Statistik di atas dihitung berdasarkan rata-rata rating ulasan pembeli setelah transaksi selesai. Pertahankan reputasimu agar jualan semakin laris!
            </p>
          </div>
        </section>
      </main>
  );
}
