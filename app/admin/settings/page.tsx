import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getSystemSettings } from "@/app/actions/admin";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const initialSettings = await getSystemSettings();

  return (
    <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-4xl mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Pengaturan Sistem Platform
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Konfigurasi parameter dan kebijakan keamanan operasional Lapak Jas Merah.
          </p>
        </header>

        <SettingsForm initialSettings={initialSettings} />
      </main>
  );
}

