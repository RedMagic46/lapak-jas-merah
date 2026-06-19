import Link from "next/link";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
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

  const [
    totalUsers,
    activeListings,
    pendingReports,
    verificationRequests,
    unpaidEscrows
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
    })
  ]);

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
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <AdminSidebar />

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
                <span>5k</span>
                <span>4k</span>
                <span>3k</span>
                <span>2k</span>
                <span>1k</span>
              </div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[40%] hover:bg-primary transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  2k
                </div>
              </div>
              <div className="w-full bg-primary/40 rounded-t-sm h-[60%] hover:bg-primary transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  3k
                </div>
              </div>
              <div className="w-full bg-primary/30 rounded-t-sm h-[50%] hover:bg-primary transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  2.5k
                </div>
              </div>
              <div className="w-full bg-primary/70 rounded-t-sm h-[85%] hover:bg-primary transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  4.2k
                </div>
              </div>
              <div className="w-full bg-primary rounded-t-sm h-[100%] cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  5k
                </div>
              </div>
              <div className="w-full bg-primary/50 rounded-t-sm h-[70%] hover:bg-primary transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  3.5k
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

          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm border border-outline-variant/20 h-[350px] flex flex-col">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 font-bold">Kategori Terpopuler</h3>
            <div className="flex-1 flex items-center justify-center gap-8">
              <div
                className="w-48 h-48 rounded-full relative"
                style={{
                  background:
                    "conic-gradient(from 0deg, #91000a 0% 45%, #4c56af 45% 75%, #ffe16d 75% 90%, #e2e2e2 90% 100%)",
                }}
              >
                <div className="absolute inset-4 bg-surface-container-lowest rounded-full shadow-inner flex items-center justify-center flex-col">
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Top</span>
                  <span className="font-headline-md text-headline-md text-primary font-bold">Buku</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Buku (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span>Elektronik (30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tertiary-fixed"></div>
                  <span>Pakaian (15%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
                  <span>Lainnya (10%)</span>
                </div>
              </div>
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
    </div>
  );
}
