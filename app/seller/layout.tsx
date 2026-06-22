import { redirect } from "next/navigation";
import SellerSidebar from "@/components/SellerSidebar";
import { getAuthUser } from "@/lib/auth";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <SellerSidebar />
      {children}
    </div>
  );
}
