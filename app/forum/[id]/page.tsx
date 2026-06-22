import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { likeForumPostAction, deleteForumPostAction, deleteForumReplyAction } from "@/app/actions/forum";
import ReplyForm from "./ReplyForm";
import DeleteButton from "./DeleteButton";

interface ForumPostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ForumPostDetailPage({ params }: ForumPostDetailPageProps) {
  const { id } = await params;
  const user = await getAuthUser();

  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  async function handleLike() {
    "use server";
    await likeForumPostAction(id);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-lg">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full pt-8 px-container-margin md:px-8 pb-section-gap">
        {/* Back Link */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold text-sm mb-6"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Kembali ke Forum
        </Link>

        {/* Main Post Card */}
        <article className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
          <header className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold">
                {post.category}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Oleh <span className="font-bold text-on-surface">
                  {post.isAnonymous ? (post.authorId === user?.id ? "Anonim (Anda)" : "Anonim") : post.authorName}
                </span>
              </span>
              <span className="text-[10px] text-on-surface-variant">•</span>
              <span className="text-xs text-on-surface-variant font-semibold">
                {new Date(post.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface leading-snug">
              {post.title}
            </h1>
          </header>

          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap mb-6">
            {post.content}
          </p>

          <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
            <div className="flex items-center gap-3">
              <form action={handleLike}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low hover:text-primary transition-colors font-bold text-xs cursor-pointer text-on-surface-variant shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] text-red-500 fill-red-500">favorite</span>
                  <span>{post.likes} Suka</span>
                </button>
              </form>

              {(user?.id === post.authorId || user?.role === "ADMIN") && (
                <DeleteButton id={post.id} type="post" action={deleteForumPostAction} />
              )}
            </div>

            <span className="text-xs text-on-surface-variant font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">chat_bubble</span>
              {post.repliesCount} Balasan
            </span>
          </div>
        </article>

        {/* Replies Section */}
        <section className="space-y-6 mb-8">
          <h3 className="font-headline-sm text-title-lg font-bold text-on-surface">
            Balasan ({post.replies.length})
          </h3>

          {post.replies.length === 0 ? (
            <div className="bg-surface-container-low/50 rounded-2xl border border-outline-variant/20 p-8 text-center text-on-surface-variant text-sm shadow-inner">
              Belum ada balasan untuk diskusi ini. Jadilah yang pertama memberikan tanggapan!
            </div>
          ) : (
            <div className="space-y-4">
              {post.replies.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex justify-between items-center gap-2 mb-2">
                    <span className="text-xs text-on-surface-variant font-bold">
                      {rep.authorName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-on-surface-variant font-semibold">
                        {new Date(rep.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {(user?.id === rep.authorId || user?.role === "ADMIN") && (
                        <DeleteButton id={rep.id} type="reply" action={deleteForumReplyAction} />
                      )}
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {rep.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reply Form */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          {user ? (
            <ReplyForm postId={post.id} />
          ) : (
            <div className="text-center py-4">
              <p className="text-on-surface-variant text-sm mb-3">
                Anda harus masuk terlebih dahulu untuk membalas diskusi ini.
              </p>
              <Link
                href="/login"
                className="inline-flex px-5 py-2 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition-opacity"
              >
                Login Sekarang
              </Link>
            </div>
          )}
        </section>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}
