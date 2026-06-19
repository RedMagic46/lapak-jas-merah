import { redirect } from "next/navigation";
import SellerSidebar from "@/components/SellerSidebar";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { profileSchema, verificationSchema } from "@/lib/validation";

export default async function SellerSettingsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const request = await prisma.verificationRequest.findUnique({
    where: { userId: user.id }
  });

  async function handleUpdateProfile(formData: FormData) {
    "use server";
    const rawData = {
      name: formData.get("name") as string,
      faculty: formData.get("faculty") as string || null,
      avatarUrl: formData.get("avatarUrl") as string || null,
    };

    const validation = profileSchema.safeParse(rawData);
    if (!validation.success) {
      throw new Error(validation.error.issues.map((e) => e.message).join(", "));
    }

    const { name, faculty, avatarUrl } = validation.data;

    await prisma.user.update({
      where: { id: user!.id },
      data: { name, faculty, avatarUrl }
    });

    revalidatePath("/seller/settings");
    revalidatePath("/");
  }

  async function handleRequestVerification(formData: FormData) {
    "use server";
    const nim = formData.get("nim") as string;
    const ktmUrl = formData.get("ktmUrl") as string || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100";

    const validation = verificationSchema.safeParse({ nim, ktmUrl });
    if (!validation.success) {
      throw new Error(validation.error.issues.map((e) => e.message).join(", "));
    }


    await prisma.verificationRequest.upsert({
      where: { userId: user!.id },
      create: {
        userId: user!.id,
        nim,
        ktmUrl,
        status: "PENDING"
      },
      update: {
        nim,
        ktmUrl,
        status: "PENDING"
      }
    });

    revalidatePath("/seller/settings");
  }


  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <SellerSidebar />

      <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-4xl mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Pengaturan Profil &amp; Verifikasi NIM
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ubah data diri toko Anda atau ajukan verifikasi kartu mahasiswa (KTM) aktif untuk mendapatkan lencana terverifikasi.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
            <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-4">Informasi Toko / Pengguna</h3>
            <form action={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="name">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    defaultValue={user.name}
                    type="text"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="faculty">
                    Fakultas / Program Studi
                  </label>
                  <input
                    id="faculty"
                    name="faculty"
                    defaultValue={user.faculty || ""}
                    placeholder="Contoh: Teknik Informatika / FT"
                    type="text"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Email UMM (Tidak dapat diubah)
                </label>
                <input
                  disabled
                  defaultValue={user.email}
                  type="email"
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface-variant cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="avatarUrl">
                  URL Foto Profil
                </label>
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  defaultValue={user.avatarUrl || ""}
                  placeholder="Masukkan link gambar eksternal"
                  type="text"
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
            <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-2">Verifikasi Identitas Mahasiswa UMM</h3>
            <p className="font-body-md text-xs text-on-surface-variant mb-6">
              Dengan memverifikasi NIM dan Kartu Tanda Mahasiswa (KTM) aktif, akun Anda akan mendapatkan lencana terverifikasi di samping nama profil, yang secara signifikan meningkatkan kepercayaan pembeli.
            </p>

            {request ? (
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant">Status Pengajuan Verifikasi Anda:</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        request.status === "PENDING"
                          ? "bg-surface-variant text-on-surface-variant"
                          : request.status === "VERIFIED"
                          ? "bg-tertiary-fixed text-on-tertiary-fixed"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {request.status}
                    </span>
                    <span className="text-xs font-bold text-on-surface">NIM: {request.nim}</span>
                  </div>
                </div>

                {request.status === "PENDING" && (
                  <p className="text-xs text-on-surface-variant max-w-[200px] text-right">
                    Menunggu verifikasi admin (estimasi 1x24 jam kerja).
                  </p>
                )}
                {request.status === "VERIFIED" && (
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Akun Anda telah terverifikasi!
                  </p>
                )}
              </div>
            ) : null}

            {(!request || request.status === "REJECTED") && (
              <form action={handleRequestVerification} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="nim">
                      Nomor Induk Mahasiswa (NIM)
                    </label>
                    <input
                      id="nim"
                      name="nim"
                      required
                      defaultValue={user.nim || ""}
                      placeholder="Masukkan NIM aktif Anda"
                      type="text"
                      className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="ktmUrl">
                      URL Foto Kartu Tanda Mahasiswa (KTM)
                    </label>
                    <input
                      id="ktmUrl"
                      name="ktmUrl"
                      required
                      placeholder="Masukkan link gambar upload KTM Anda"
                      type="text"
                      className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  >
                    Ajukan Verifikasi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
