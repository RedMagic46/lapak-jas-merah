import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserTableClient from "./UserTableClient";

export default async function AdminUsersPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Manajemen Pengguna
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Daftar seluruh mahasiswa UMM yang terdaftar di sistem. Anda dapat mengubah data pengguna, memantau peranan (Role), memblokir akun yang melanggar, dan memantau status verifikasi.
          </p>
        </header>

        <UserTableClient users={users} currentAdminId={user.id} />
      </main>
  );
}
