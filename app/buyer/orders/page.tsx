import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import BuyerOrdersList from "./BuyerOrdersList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belanjaan Saya - Lapak Jas Merah UMM",
  description: "Riwayat pembelian dan status transaksi COD belanja Anda di Lapak Jas Merah Universitas Muhammadiyah Malang.",
};

export default async function BuyerOrdersPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch transactions where the current user is the buyer
  const transactions = await prisma.transaction.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      meetupLocation: true,
      meetupTime: true,
      notes: true,
      productId: true,
      paymentMethod: true,
      paymentStatus: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          name: true,
          nim: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrl: true,
          reviews: {
            where: {
              userId: user.id,
            },
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  // Map transactions to simplify reviews format for the client component
  const serializedTransactions = transactions.map((tx) => {
    const review = tx.product.reviews[0] || null;
    return {
      ...tx,
      createdAt: tx.createdAt.toISOString(),
      meetupTime: tx.meetupTime ? tx.meetupTime.toISOString() : null,
      hasReviewed: review !== null,
      userReview: review
        ? {
            ...review,
            createdAt: review.createdAt.toISOString(),
          }
        : null,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-container-margin md:px-[80px] py-8">
        <BuyerOrdersList initialTransactions={serializedTransactions} />
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
