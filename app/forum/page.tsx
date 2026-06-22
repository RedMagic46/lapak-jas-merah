import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ForumClient from "./ForumClient";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function ForumPage() {
  const user = await getSession();

  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-lg">
      <Navbar />

      <div className="flex-1 max-w-[1440px] mx-auto w-full pt-8 px-container-margin md:px-[80px] pb-section-gap">
        <header className="mb-8">
          <h1 className="font-headline-lg text-headline-lg md:text-headline-lg-mobile text-on-surface font-bold leading-tight">
            Forum Komunitas Mahasiswa UMM
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Bagikan informasi, tanyakan perihal tugas akademik, info kosan, atau diskusikan kegiatan kampus bersama teman sejawat.
          </p>
        </header>

        <ForumClient initialPosts={posts} user={user} />
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}
