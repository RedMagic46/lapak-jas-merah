import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createFAQ, deleteFAQ } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminFAQPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const faqs = await prisma.fAQ.findMany({
    orderBy: { createdAt: "desc" }
  });

  async function handleCreate(formData: FormData) {
    "use server";
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    await createFAQ(question, answer);
    revalidatePath("/admin/faq");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const faqId = formData.get("faqId") as string;
    await deleteFAQ(faqId);
    revalidatePath("/admin/faq");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 p-container-margin w-full max-w-4xl mx-auto pb-20">
        <header className="mb-8">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold leading-tight">
            Kelola Pertanyaan Umum (FAQ)
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ubah atau tambahkan panduan FAQ baru bagi pengguna Marketplace Lapak Jas Merah.
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm mb-8">
          <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-4">Tambah FAQ Baru</h3>
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="question">
                Pertanyaan
              </label>
              <input
                id="question"
                name="question"
                required
                placeholder="Contoh: Bagaimana cara mengubah peran menjadi Penjual?"
                type="text"
                className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="answer">
                Jawaban Singkat
              </label>
              <textarea
                id="answer"
                name="answer"
                required
                rows={3}
                placeholder="Tuliskan petunjuk jawaban yang informatif..."
                className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
              ></textarea>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                Simpan FAQ
              </button>
            </div>
          </form>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-bright font-bold font-title-lg text-on-surface">
            Daftar FAQ Aktif
          </div>
          {faqs.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant/65 text-sm">
              Belum ada FAQ terdaftar.
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-6 flex justify-between items-start gap-6 hover:bg-surface-container-lowest/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-on-surface text-sm">{faq.question}</h4>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{faq.answer}</p>
                  </div>
                  <form action={handleDelete} className="shrink-0">
                    <input type="hidden" name="faqId" value={faq.id} />
                    <button
                      type="submit"
                      className="p-1.5 text-error hover:bg-error-container/30 rounded transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
