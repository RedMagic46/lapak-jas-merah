import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import HelpContent from "./HelpContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Bantuan - Lapak Jas Merah UMM",
  description: "Temukan jawaban atas berbagai pertanyaan (FAQ) dan panduan transaksi di Lapak Jas Merah Universitas Muhammadiyah Malang.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <Navbar />
      <main className="flex-1">
        <HelpContent />
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}
