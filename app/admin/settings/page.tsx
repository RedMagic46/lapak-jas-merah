import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuthUser } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-4xl mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Pengaturan Sistem Platform
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Konfigurasi parameter dan kebijakan keamanan operasional Lapak Jas Merah.
          </p>
        </header>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
            <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-4">Pengaturan Global</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Auto-verifikasi Domain Email UMM</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Ijinkan pendaftaran akun langsung aktif jika menggunakan webmail.umm.ac.id.</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary h-5 w-5 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Mode Pemeliharaan (Maintenance)</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Tutup akses pasar sementara waktu untuk proses perbaikan database.</p>
                </div>
                <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary h-5 w-5 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
            <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-4">Batasan Transaksi &amp; Keamanan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Maksimum Ukuran Upload Foto (MB)
                </label>
                <input
                  defaultValue={5}
                  type="number"
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Batas Maksimal COD per Hari
                </label>
                <input
                  defaultValue={10}
                  type="number"
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="pt-4">
              <button className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm">
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
