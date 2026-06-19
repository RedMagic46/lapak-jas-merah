"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", href: "/admin" },
    { name: "Manajemen User", icon: "people", href: "/admin/users" },
    { name: "Inventaris Produk", icon: "inventory_2", href: "/admin/products" },
    { name: "Verifikasi Pengguna", icon: "verified_user", href: "/admin/verifications" },
    { name: "Moderasi Ulasan", icon: "rate_review", href: "/admin/reviews" },
    { name: "Moderasi Forum", icon: "forum", href: "/admin/forum" },
    { name: "FAQ", icon: "help", href: "/admin/faq" },
    { name: "Promosi Iklan", icon: "campaign", href: "/admin/promotions" },
    { name: "Pengaturan", icon: "settings", href: "/admin/settings" },
  ];

  return (
    <nav className="hidden lg:flex flex-col gap-unit p-card-padding border-r border-outline-variant h-full w-64 fixed left-0 top-0 bg-surface-container-low shadow-md z-40">
      <div className="flex items-center gap-3 mb-8 px-2 mt-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
          UMM
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Admin Panel</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Lapak Jas Merah</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container translate-x-1"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:bg-primary-container/10"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto">
        <form action="/api/auth/logout" method="POST" className="w-full">
          <button
            type="submit"
            className="w-full border border-outline text-on-surface-variant font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
