"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isMarketplace = pathname.startsWith("/marketplace");
  const isChat = pathname.startsWith("/chat");
  const isProfile = pathname.startsWith("/seller/settings");

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl border-t border-outline-variant/30">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center rounded-lg p-2 transition-colors ${
          isHome
            ? "bg-primary-container text-on-primary-container px-4 py-1 scale-90 duration-200"
            : "text-on-surface-variant hover:bg-surface-container-highest/50"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isHome ? "'FILL' 1" : "'FILL' 0" }}>
          home
        </span>
        <span className="font-label-sm text-[11px] font-medium leading-[14px]">Beranda</span>
      </Link>

      <Link
        href="/marketplace"
        className={`flex flex-col items-center justify-center rounded-lg p-2 transition-colors ${
          isMarketplace
            ? "bg-primary-container text-on-primary-container px-4 py-1 scale-90 duration-200"
            : "text-on-surface-variant hover:bg-surface-container-highest/50"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isMarketplace ? "'FILL' 1" : "'FILL' 0" }}>
          storefront
        </span>
        <span className="font-label-sm text-[11px] font-medium leading-[14px]">Pasar</span>
      </Link>

      <Link
        href="/chat"
        className={`flex flex-col items-center justify-center rounded-lg p-2 transition-colors ${
          isChat
            ? "bg-primary-container text-on-primary-container px-4 py-1 scale-90 duration-200"
            : "text-on-surface-variant hover:bg-surface-container-highest/50"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isChat ? "'FILL' 1" : "'FILL' 0" }}>
          chat
        </span>
        <span className="font-label-sm text-[11px] font-medium leading-[14px]">Chat</span>
      </Link>

      <Link
        href="/seller/settings"
        className={`flex flex-col items-center justify-center rounded-lg p-2 transition-colors ${
          isProfile
            ? "bg-primary-container text-on-primary-container px-4 py-1 scale-90 duration-200"
            : "text-on-surface-variant hover:bg-surface-container-highest/50"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}>
          person
        </span>
        <span className="font-label-sm text-[11px] font-medium leading-[14px]">Profil</span>
      </Link>
    </nav>
  );
}
