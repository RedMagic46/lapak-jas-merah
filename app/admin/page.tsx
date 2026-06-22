import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyUserKTM } from "@/app/actions/admin";
import { verifyEscrowPayment } from "@/app/actions/transactions";
import { revalidatePath } from "next/cache";

export default async function AdminDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 5);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeListings,
    pendingReports,
    verificationRequests,
    unpaidEscrows,
    transactionsLast6Months,
    productsGrouped
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      include: { reporter: true, targetProduct: true, targetUser: true }
    }),
    prisma.verificationRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true }
    }),
    prisma.transaction.findMany({
      where: {
        paymentMethod: { in: ["ESCROW_TRANSFER", "ESCROW_QRIS"] },
        paymentStatus: "PAID"
      },
      include: {
        buyer: true,
        product: true
      }
    }),
    prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.product.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      where: {
        status: "ACTIVE",
      },
    })
  ]);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      name: d.toLocaleString("id-ID", { month: "short" }),
    };
  }).reverse();

  const transactionCounts = last6Months.map((m) => {
    const count = transactionsLast6Months.filter((t) => {
      const date = new Date(t.createdAt);
      return date.getMonth() === m.month && date.getFullYear() === m.year;
    }).length;
    return {
      name: m.name,
      count,
    };
  });

  const maxCount = Math.max(...transactionCounts.map((tc) => tc.count), 1);

  const totalActiveProducts = productsGrouped.reduce((acc, curr) => acc + curr._count.id, 0);

  const categoryStats = productsGrouped.map((g) => ({
    category: g.category,
    count: g._count.id,
    percentage: totalActiveProducts > 0 ? Math.round((g._count.id / totalActiveProducts) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const topCategories = categoryStats.slice(0, 4);

  const colors = ["#91000a", "#4c56af", "#ffe16d", "#e2e2e2"];
  let accumPercent = 0;
  const gradientParts: string[] = [];
  topCategories.forEach((tc, idx) => {
    const start = accumPercent;
    accumPercent += tc.percentage;
    const end = accumPercent;
    gradientParts.push(`${colors[idx % colors.length]} ${start}% ${end}%`);
  });

  if (accumPercent < 100) {
    gradientParts.push(`#e2e2e2 ${accumPercent}% 100%`);
  }

  const conicGradientStyle = `conic-gradient(from 0deg, ${gradientParts.join(", ")})`;
  const topCategoryName = topCategories[0]?.category || "N/A";

  async function handleVerifyKTM(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    const status = formData.get("status") as string;
    await verifyUserKTM(requestId, status);
    revalidatePath("/admin");
  }

  async function handleVerifyPayment(formData: FormData) {
    "use server";
    const txId = formData.get("txId") as string;
    const approve = formData.get("approve") === "true";
    await verifyEscrowPayment(txId, approve);
    revalidatePath("/admin");
  }

  return (
    <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
              Ringkasan Sistem (Overview)
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Lapak Jas Merah Management &amp; Moderation Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full shadow-sm border border-outline-variant/35">
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
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-primary-container/10 text-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-1 rounded-full font-bold">
                Aktif
              </span>
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1 text-xs">Total Pengguna UMM</p>
              <h3 className="font-display-lg text-headline-lg text-on-surface font-bold">
                {totalUsers.toLocaleString("id-ID")} Users
              </h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-tertiary-container/20 text-tertiary">
                <span className="material-symbols-outlined">storefront</span>
              </div>
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1 text-xs">Barang Ditawarkan</p>
              <h3 className="font-display-lg text-headline-lg text-on-surface font-bold">
                {activeListings.toLocaleString("id-ID")} Listings
              </h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-error-container/30 text-error">
                <span className="material-symbols-outlined">report</span>
              </div>
              {pendingReports.length > 0 && (
                <span className="font-label-sm text-label-sm text-error bg-error-container/20 px-2 py-1 rounded-full font-bold">
                  Butuh Tindakan
                </span>
              )}
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1 text-xs">Laporan Pelanggaran</p>
              <h3 className="font-display-lg text-headline-lg text-on-surface font-bold">
                {pendingReports.length} Laporan
              </h3>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-8">
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/20 h-[350px] flex flex-col">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 font-bold">Transaksi Bulanan</h3>
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
                    className="w-full bg-primary/40 rounded-t-sm hover:bg-primary transition-colors cursor-pointer group relative min-h-[4px]"
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

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/20 h-[350px] flex flex-col">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 font-bold">Kategori Terpopuler</h3>
            <div className="flex-1 flex items-center justify-center gap-8">
              {topCategories.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Belum ada barang aktif</p>
              ) : (
                <>
                  <div
                    className="w-48 h-48 rounded-full relative"
                    style={{
                      background: conicGradientStyle,
                    }}
                  >
                    <div className="absolute inset-4 bg-surface-container-lowest rounded-full shadow-inner flex items-center justify-center flex-col">
                      <span className="font-label-sm text-[10px] text-on-surface-variant">Top</span>
                      <span className="font-headline-md text-headline-md text-primary font-bold truncate max-w-[120px]">
                        {topCategoryName}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 text-xs font-semibold">
                    {topCategories.map((tc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[idx % colors.length] }}
                        ></div>
                        <span className="truncate max-w-[100px]">
                          {tc.category} ({tc.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden">
            <div className="p-card-padding border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Laporan Pelanggaran Aktif</h3>
              <Link href="/admin/products" className="text-primary font-label-md text-label-md hover:underline font-bold">
                Moderat Produk
              </Link>
            </div>
            <div className="overflow-x-auto">
              {pendingReports.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant/65 text-sm">
                  Tidak ada laporan pelanggaran yang tertunda saat ini.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                      <th className="py-3 px-4">Subjek Laporan</th>
                      <th className="py-3 px-4">Alasan</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                    {pendingReports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-primary">
                              {rep.targetProduct?.title || rep.targetUser?.name || "LJM Item"}
                            </p>
                            <p className="text-[10px] text-on-surface-variant">Oleh: {rep.reporter.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs max-w-[150px] truncate">{rep.reason}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-error-container text-on-error-container">
                            PENDING
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden">
            <div className="p-card-padding border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Antrean Verifikasi NIM</h3>
              <Link href="/admin/verifications" className="text-primary font-label-md text-label-md hover:underline font-bold">
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              {verificationRequests.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant/65 text-sm">
                  Tidak ada permintaan verifikasi NIM baru.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                      <th className="py-3 px-4">Data Mahasiswa</th>
                      <th className="py-3 px-4">Fakultas</th>
                      <th className="py-3 px-4 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                    {verificationRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-on-surface">{req.user.name}</p>
                          <p className="font-label-sm text-[10px] text-on-surface-variant">NIM: {req.nim}</p>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-on-surface-variant">
                          {req.user.faculty || "Umum"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <form action={handleVerifyKTM}>
                              <input type="hidden" name="requestId" value={req.id} />
                              <input type="hidden" name="status" value="REJECTED" />
                              <button
                                type="submit"
                                className="w-7 h-7 flex items-center justify-center rounded bg-error-container text-error hover:bg-error hover:text-on-error transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">close</span>
                              </button>
                            </form>
                            <form action={handleVerifyKTM}>
                              <input type="hidden" name="requestId" value={req.id} />
                              <input type="hidden" name="status" value="VERIFIED" />
                              <button
                                type="submit"
                                className="w-7 h-7 flex items-center justify-center rounded bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">check</span>
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
        </section>

        <section className="mt-8">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden">
            <div className="p-card-padding border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Verifikasi Pembayaran Rekening Bersama (Escrow)</h3>
            </div>
            <div className="overflow-x-auto">
              {unpaidEscrows.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant/65 text-sm">
                  Tidak ada antrean verifikasi pembayaran Rekber baru saat ini.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                      <th className="py-3 px-4">Pembeli</th>
                      <th className="py-3 px-4">Barang &amp; Total Tagihan</th>
                      <th className="py-3 px-4">Bukti Transfer</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                    {unpaidEscrows.map((esc) => (
                      <tr key={esc.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-on-surface">{esc.buyer.name}</p>
                          <p className="font-label-sm text-[10px] text-on-surface-variant">NIM: {esc.buyer.nim || "-"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-primary">{esc.product.title}</p>
                          <p className="font-label-sm text-[11px] text-on-surface-variant">
                            Rp {esc.product.price.toLocaleString("id-ID")} via {esc.paymentMethod === "ESCROW_QRIS" ? "QRIS" : "Transfer Bank"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-on-surface-variant">
                          {esc.paymentProofUrl ? (
                            <a
                              href={esc.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 font-bold"
                            >
                              <span className="material-symbols-outlined text-sm">photo</span>
                              Lihat Bukti
                            </a>
                          ) : (
                            <span className="text-error">Tidak ada gambar</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <form action={handleVerifyPayment}>
                              <input type="hidden" name="txId" value={esc.id} />
                              <input type="hidden" name="approve" value="false" />
                              <button
                                type="submit"
                                className="w-7 h-7 flex items-center justify-center rounded bg-error-container text-error hover:bg-error hover:text-on-error transition-colors cursor-pointer"
                                title="Tolak / Batalkan Pembayaran"
                              >
                                <span className="material-symbols-outlined text-xs">close</span>
                              </button>
                            </form>
                            <form action={handleVerifyPayment}>
                              <input type="hidden" name="txId" value={esc.id} />
                              <input type="hidden" name="approve" value="true" />
                              <button
                                type="submit"
                                className="w-7 h-7 flex items-center justify-center rounded bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer"
                                title="Verifikasi & Simpan Pembayaran"
                              >
                                <span className="material-symbols-outlined text-xs">check</span>
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
        </section>
      </main>
  );
}
