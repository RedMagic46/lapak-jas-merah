import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createTransactionRequest } from "@/app/actions/transactions";

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

  const codLocations = product.isService
    ? [
        "Pertemuan Online via Zoom/Google Meet/Discord",
        "Lobi GKB 1 UMM Kampus 3",
        "Lobi GKB 2 UMM Kampus 3",
        "Gazebo Rektorat UMM Kampus 3",
        "Depan Perpustakaan Pusat UMM",
        "Lobi Kampus 2 UMM (Bendungan Sutami)",
      ]
    : [
        "Lobi GKB 1 UMM Kampus 3",
        "Lobi GKB 2 UMM Kampus 3",
        "Gazebo Rektorat UMM Kampus 3",
        "Depan Perpustakaan Pusat UMM",
        "Lobi Kampus 2 UMM (Bendungan Sutami)",
      ];

  async function handleFormSubmit(formData: FormData) {
    "use server";
    const res = await createTransactionRequest(id, formData);
    if (res.success) {
      redirect("/chat");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-lg">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto w-full pt-8 px-container-margin pb-section-gap">
        <div className="mb-6">
          <Link
            href={`/marketplace/${id}`}
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
            Kembali ke Detail Produk
          </Link>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30">
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-2">
            {product.isService ? "Pesan Jasa & Bimbingan Akademik" : "Ajukan Transaksi COD"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            {product.isService
              ? "Tentukan metode bimbingan (online/offline) serta tentukan kesepakatan pertemuan dengan tutor."
              : "Pilihlah salah satu area titik temu COD yang aman (Safe Zone UMM) dan tentukan waktu kesepakatan nugas/bertemu dengan penjual."}
          </p>

          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 mb-8">
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
              <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
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

          <div className="mb-6 bg-secondary-fixed/30 border border-secondary-fixed-dim text-on-secondary-fixed-variant text-xs p-4 rounded-lg flex gap-2">
            <span className="material-symbols-outlined text-lg shrink-0">info</span>
            <div>
              <p className="font-semibold">
                {product.isService ? "Layanan Bimbingan / Tutor Sebaya" : "Titik Temu Aman (Safe Zone UMM)"}
              </p>
              <p className="mt-0.5">
                {product.isService
                  ? "Untuk keamanan bimbingan akademik, Anda dapat menyepakati pertemuan langsung di safe zone kampus atau online via Google Meet/Zoom/Discord. Harap gunakan escrow LJM jika pembayaran berbayar."
                  : "Area ini direkomendasikan karena terjangkau WiFi kampus, memiliki lalu lintas pejalan kaki yang ramai, dan terpantau CCTV keamanan Universitas. Jangan pernah melakukan transfer dana sebelum memeriksa kondisi barang secara langsung!"}
              </p>
            </div>
          </div>

          <form action={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="meetupLocation">
                {product.isService ? "Pilih Metode / Tempat Pertemuan" : "Pilih Titik COD Safe Zone"}
              </label>
              <select
                id="meetupLocation"
                name="meetupLocation"
                required
                className="block w-full border border-outline-variant rounded-lg bg-surface px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">{product.isService ? "-- Pilih Metode Pertemuan --" : "-- Pilih Safe Zone COD --"}</option>
                {codLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="meetupTime">
                Waktu Pertemuan (Opsional)
              </label>
              <input
                id="meetupTime"
                name="meetupTime"
                type="datetime-local"
                className="block w-full border border-outline-variant rounded-lg bg-surface px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="paymentMethod">
                Metode Pembayaran / Transaksi
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                required
                className="block w-full border border-outline-variant rounded-lg bg-surface px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
              >
                <option value="COD_CASH">COD - Bayar Tunai Saat Bertemu</option>
                <option value="ESCROW_TRANSFER">Rekening Bersama (Escrow) - Transfer Bank Mandiri</option>
                <option value="ESCROW_QRIS">Rekening Bersama (Escrow) - QRIS UMM Pay</option>
              </select>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                Gunakan **Rekening Bersama UMM (Escrow)** untuk jaminan keamanan penuh. Uang Anda akan ditahan oleh sistem Lapak Jas Merah dan hanya diteruskan ke penjual setelah Anda mengonfirmasi barang diterima saat COD.
              </p>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="notes">
                Catatan Tambahan untuk Penjual
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Tuliskan detail pertemuan Anda (misal: 'Saya pakai jaket almamater merah, nunggu di dekat tangga lobby')"
                className="block w-full border border-outline-variant rounded-lg bg-surface px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"
              ></textarea>
            </div>

            <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
              <Link
                href={`/marketplace/${id}`}
                className="flex-1 text-center border border-outline text-on-surface-variant hover:bg-surface-container-low py-3 rounded-lg font-label-md text-label-md font-semibold transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                className="flex-1 bg-primary text-on-primary hover:bg-primary-container py-3 rounded-lg font-label-md text-label-md font-bold transition-colors shadow-sm"
              >
                Kirim Pengajuan COD
              </button>
            </div>
          </form>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
