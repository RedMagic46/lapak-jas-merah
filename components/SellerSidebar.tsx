"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SellerSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", href: "/seller" },
    { name: "Produk Saya", icon: "inventory_2", href: "/seller/products" },
    { name: "Daftar Pesanan", icon: "shopping_cart", href: "/seller/orders" },
    { name: "Analitik Toko", icon: "analytics", href: "/seller/analytics" },
    { name: "Inbox Seller", icon: "chat", href: "/seller/chat" },
    { name: "Pengaturan Profil", icon: "settings", href: "/seller/settings" },
  ];

  return (
    <nav className="hidden lg:flex flex-col gap-unit p-card-padding border-r border-outline-variant h-full w-64 fixed left-0 top-0 bg-surface-container-low shadow-md z-40">
      <div className="flex items-center gap-3 mb-8 px-2 mt-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
          JSM
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Seller Center</h1>
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
                  ? "bg-primary text-on-primary translate-x-1"
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

      <div className="mt-auto space-y-2">
        <Link
          href="/marketplace"
          className="w-full border border-primary text-primary font-label-md text-label-md py-2.5 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">storefront</span>
          <span>Buka Pasar</span>
        </Link>

        <form action="/api/auth/logout" method="POST" className="w-full">
          <button
            type="submit"
            className="w-full border border-outline text-on-surface-variant font-label-md text-label-md py-2.5 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
