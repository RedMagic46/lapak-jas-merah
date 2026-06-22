import Link from "next/link";
import { getAuthUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getAuthUser();

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-container-margin md:px-[80px] w-full h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="flex items-center gap-gutter">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
          Lapak Jas Merah
        </Link>
      </div>

      <nav className="hidden lg:flex items-center gap-6 font-label-md text-label-md text-on-surface-variant ml-8">
        <Link href="/marketplace" className="hover:text-primary transition-colors">
          Marketplace
        </Link>
        <Link href="/forum" className="hover:text-primary transition-colors">
          Forum
        </Link>
        <Link href="/#faq" className="hover:text-primary transition-colors">
          FAQ
        </Link>
      </nav>

      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <form action="/marketplace" method="GET">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
            search
          </span>
          <input
            name="search"
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-full py-1.5 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md shadow-inner transition-colors"
            placeholder="Cari buku, jas lab, atau kos..."
            type="text"
          />
        </form>
      </div>

      <nav className="flex items-center gap-unit">
        {user ? (
          <>
            <Link
              href="/chat"
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors relative"
              title="Pesan"
            >
              <span className="material-symbols-outlined">chat</span>
            </Link>

            {(user.role === "SELLER" || user.role === "BUYER") && (
              <Link
                href="/seller"
                className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full font-label-md text-label-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span>Seller Panel</span>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-secondary-container/20 text-on-secondary-container hover:bg-secondary-container/30 rounded-full font-label-md text-label-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <span>Admin Panel</span>
              </Link>
            )}

            <Link
              href="/seller/settings"
              className="flex items-center gap-2 pl-2 pr-4 py-1 bg-surface-container-lowest hover:bg-surface-container-low rounded-full border border-outline-variant/35 transition-colors"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-outline-variant/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="font-label-md text-label-md text-on-surface hidden sm:block max-w-[100px] truncate">
                {user.name}
              </span>
            </Link>

            <form action="/api/auth/logout" method="POST" className="inline">
              <button
                type="submit"
                className="p-2 rounded-full text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-4 py-1.5 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/5 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors"
            >
              Daftar
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
