import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuthUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <AdminSidebar />
      {children}
    </div>
  );
}
