import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyUserKTM } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminVerificationsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const requests = await prisma.verificationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  async function handleVerify(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    const status = formData.get("status") as string;
    await verifyUserKTM(requestId, status);
    revalidatePath("/admin/verifications");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <AdminSidebar />

      <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Antrean Verifikasi Pengguna
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tinjau dokumen KTM (Kartu Tanda Mahasiswa) UMM yang diunggah oleh mahasiswa. Pastikan NIM dan data diri aktif di sistem pangkalan data kampus.
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                  <th className="py-3 px-4">Nama Mahasiswa</th>
                  <th className="py-3 px-4">NIM Diajukan</th>
                  <th className="py-3 px-4">Dokumen KTM</th>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-primary">{req.user.name}</td>
                    <td className="py-3 px-4 font-bold text-xs">{req.nim}</td>
                    <td className="py-3 px-4">
                      <a
                        href={req.ktmUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-secondary hover:underline font-semibold text-xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Lihat KTM
                      </a>
                    </td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant">
                      {new Date(req.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === "PENDING" ? "bg-surface-variant text-on-surface-variant" : req.status === "VERIFIED" ? "bg-green-100 text-green-800" : "bg-error-container text-on-error-container"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <form action={handleVerify}>
                            <input type="hidden" name="requestId" value={req.id} />
                            <input type="hidden" name="status" value="REJECTED" />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-error-container text-error hover:bg-error hover:text-on-error transition-colors rounded text-xs font-bold cursor-pointer"
                            >
                              Tolak
                            </button>
                          </form>
                          <form action={handleVerify}>
                            <input type="hidden" name="requestId" value={req.id} />
                            <input type="hidden" name="status" value="VERIFIED" />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-primary text-on-primary hover:bg-primary-container transition-colors rounded text-xs font-bold cursor-pointer"
                            >
                              Setujui
                            </button>
                          </form>
                        </div>
                      )}
                      {req.status !== "PENDING" && (
                        <span className="text-xs text-on-surface-variant font-bold">Selesai diproses</span>
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
