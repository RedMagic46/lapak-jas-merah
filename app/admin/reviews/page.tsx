import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteReview } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminReviewsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: true, product: true }
  });

  async function handleDelete(formData: FormData) {
    "use server";
    const reviewId = formData.get("reviewId") as string;
    await deleteReview(reviewId);
    revalidatePath("/admin/reviews");
  }

  return (
    <main className="flex-grow lg:ml-64 p-container-margin w-full max-w-[1440px] mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Moderasi Ulasan Pengguna
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tinjau seluruh ulasan dan rating barang. Hapus ulasan yang mengandung kata kasar, spam, promosi terselubung, atau pencemaran nama baik.
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
          {reviews.length === 0 ? (
            <div className="p-16 text-center text-on-surface-variant/65">
              Belum ada ulasan terdaftar dalam sistem.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                    <th className="py-3 px-4">Barang</th>
                    <th className="py-3 px-4">Pengirim</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Komentar</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-right">Moderasi</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-primary">{r.product.title}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-on-surface-variant">{r.user.name}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className="text-tertiary font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {r.rating}/5
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs max-w-[200px] truncate">{r.comment}</td>
                      <td className="py-3 px-4 text-xs text-on-surface-variant">
                        {new Date(r.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <form action={handleDelete}>
                          <input type="hidden" name="reviewId" value={r.id} />
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
