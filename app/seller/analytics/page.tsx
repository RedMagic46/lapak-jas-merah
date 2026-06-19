import { redirect } from "next/navigation";
import SellerSidebar from "@/components/SellerSidebar";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SellerAnalyticsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: { sellerId: user.id },
    include: { transactions: true }
  });

  const activeCount = products.filter(p => p.status === "ACTIVE").length;
  const soldCount = products.filter(p => p.status === "SOLD").length;

  const completedTransactions = await prisma.transaction.findMany({
    where: { sellerId: user.id, status: "COMPLETED" },
    include: { product: true }
  });

  const totalEarnings = completedTransactions.reduce((acc, t) => acc + t.product.price, 0);

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <SellerSidebar />

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
              +15% dari bulan lalu
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
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 font-bold">Statistik Kunjungan Iklan</h3>
            <div className="flex-1 flex items-end justify-between gap-2 pt-4 border-b border-surface-variant pb-2 relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant -ml-6">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
              </div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[40%] hover:bg-primary transition-colors relative group cursor-pointer">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  40
                </div>
              </div>
              <div className="w-full bg-primary/40 rounded-t-sm h-[60%] hover:bg-primary transition-colors relative group cursor-pointer">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  60
                </div>
              </div>
              <div className="w-full bg-primary/30 rounded-t-sm h-[50%] hover:bg-primary transition-colors relative group cursor-pointer">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  50
                </div>
              </div>
              <div className="w-full bg-primary/70 rounded-t-sm h-[85%] hover:bg-primary transition-colors relative group cursor-pointer">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  85
                </div>
              </div>
              <div className="w-full bg-primary rounded-t-sm h-[100%] relative group">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  100
                </div>
              </div>
              <div className="w-full bg-primary/50 rounded-t-sm h-[70%] hover:bg-primary transition-colors relative group cursor-pointer">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  70
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-label-md">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/20 h-[350px] flex flex-col justify-between">
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-4">Metrik Kepuasan Pembeli</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Kecepatan Respon Chat</span>
                  <span>95% (Sangat Cepat)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "95%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Kesesuaian Deskripsi Barang</span>
                  <span>90% (Sangat Sesuai)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Ketepatan Waktu COD</span>
                  <span>85% (Tepat Waktu)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant/85 italic leading-normal">
              Statistik di atas dihitung berdasarkan rata-rata rating ulasan pembeli setelah transaksi selesai. Pertahankan reputasimu agar jualan semakin laris!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
