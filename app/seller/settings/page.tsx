import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerSettingsForm from "@/components/SellerSettingsForm";

export default async function SellerSettingsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch the verification request status from database
  const request = await prisma.verificationRequest.findUnique({
    where: { userId: user.id }
  });

  // Convert Date fields to match type definitions if needed, or serialize dates safely
  const serializedRequest = request ? {
    ...request,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  } : null;

  return (
    <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-4xl mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Pengaturan Profil &amp; Verifikasi NIM
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ubah data diri toko Anda atau ajukan verifikasi kartu mahasiswa (KTM) aktif untuk mendapatkan lencana terverifikasi.
          </p>
        </header>

        <SellerSettingsForm user={user} request={serializedRequest} />
      </main>
  );
}
