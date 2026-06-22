import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import TransactionForm from "./TransactionForm";

export default async function CreateTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthUser();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: true }
  });

  if (!product) {
    notFound();
  }

  if (product.sellerId === user?.id) {
    redirect(`/marketplace/${id}`);
  }

  const existingPending = user
    ? await prisma.transaction.findFirst({
        where: {
          productId: id,
          buyerId: user.id,
          status: "PENDING",
        },
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-lg">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full pt-8 px-6 md:px-20 pb-section-gap">
        <div className="mb-6">
          <Link
            href={`/marketplace/${id}`}
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
            Kembali ke Detail Produk
          </Link>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">
            {product.isService ? "Jadwalkan Layanan & Jasa" : "Ajukan Transaksi COD"}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {product.isService 
              ? "Tentukan metode bimbingan (online/offline) serta tentukan kesepakatan pertemuan dengan tutor." 
              : "Pilihlah salah satu area titik temu COD yang aman (Safe Zone UMM) dan tentukan waktu pertemuan dengan penjual."}
          </p>
        </div>

        {/* Product Details Block */}
        <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-8">
          <div className="w-16 h-16 bg-surface-container-highest rounded-lg overflow-hidden border border-outline-variant/30 shrink-0">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <h3 className="font-title-lg text-body-lg text-on-surface font-bold truncate mt-1">
              {product.title}
            </h3>
            <p className="font-headline-md text-sm text-primary font-bold mt-0.5">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Interactive Transaction Form Component */}
        {existingPending ? (
          <div className="bg-error/5 border border-error/20 rounded-xl p-6 text-center max-w-xl mx-auto shadow-sm my-8">
            <span className="material-symbols-outlined text-error text-5xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <h2 className="font-title-lg text-title-lg text-on-background font-bold mb-2">Permintaan Transaksi Sedang Berjalan</h2>
            <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
              Anda sudah mengirimkan pengajuan COD untuk produk ini. Harap tunggu penjual menerima atau menolak pengajuan Anda saat ini sebelum membuat permintaan baru.
            </p>
            <Link
              href={`/chat?partnerId=${product.sellerId}&productId=${product.id}`}
              className="inline-block bg-primary hover:bg-primary-container text-on-primary font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm text-sm"
            >
              Buka Percakapan Chat
            </Link>
          </div>
        ) : (
          <TransactionForm productId={id} product={product} />
        )}
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
