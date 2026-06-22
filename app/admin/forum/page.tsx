import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteForumPost } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminForumPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  async function handleDelete(formData: FormData) {
    "use server";
    const postId = formData.get("postId") as string;
    await deleteForumPost(postId);
    revalidatePath("/admin/forum");
  }

  return (
    <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Moderasi Forum Komunitas
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tinjau seluruh utas (Threads) diskusi mahasiswa. Pastikan konten mendidik, tertib, dan tidak berbau unsur SARA atau provokasi negatif.
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-16 text-center text-on-surface-variant/65">
              Belum ada forum diskusi terdaftar dalam sistem.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                    <th className="py-3 px-4">Judul Diskusi</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Pembuat</th>
                    <th className="py-3 px-4">Isi Utas</th>
                    <th className="py-3 px-4">Likes / Balasan</th>
                    <th className="py-3 px-4 text-right">Moderasi</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-primary">{post.title}</td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        <span className="bg-primary-container/10 text-primary px-2 py-0.5 rounded text-[10px]">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-on-surface-variant">
                        {post.authorName} {post.isAnonymous && <span className="text-error font-bold ml-1">(Anonim)</span>}
                      </td>
                      <td className="py-3 px-4 text-xs max-w-[200px] truncate">{post.content}</td>
                      <td className="py-3 px-4 text-xs font-bold text-on-surface-variant">
                        {post.likes} Likes / {post.repliesCount} Balasan
                      </td>
                      <td className="py-3 px-4 text-right">
                        <form action={handleDelete}>
                          <input type="hidden" name="postId" value={post.id} />
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-error-container text-error rounded hover:bg-error hover:text-on-error transition-colors text-xs font-bold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
  );
}
