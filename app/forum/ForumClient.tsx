"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createForumPostAction } from "@/app/actions/forum";
import type { SessionPayload } from "@/lib/types";

interface ForumPostData {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  likes: number;
  repliesCount: number;
  createdAt: Date;
}

interface ForumClientProps {
  initialPosts: ForumPostData[];
  user: SessionPayload | null;
}

export default function ForumClient({ initialPosts, user }: ForumClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPostData[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Info Kampus");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Semua", "Akademik", "Jual Beli", "Kost & Kontrakan", "Info Kampus", "Kegiatan Mahasiswa"];
  const formCategories = ["Akademik", "Jual Beli", "Kost & Kontrakan", "Info Kampus", "Kegiatan Mahasiswa"];

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Anda harus masuk terlebih dahulu.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    formData.append("isAnonymous", isAnonymous ? "true" : "false");

    try {
      const res = await createForumPostAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.validationErrors) {
        setError(Object.values(res.validationErrors).join(", "));
      } else if (res?.success && res.data) {
        setIsModalOpen(false);
        setTitle("");
        setContent("");
        setIsAnonymous(false);
        router.push(`/forum/${res.data}`);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal membuat diskusi. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 shadow-sm sticky top-24">
          <h3 className="font-title-lg text-title-lg text-on-surface mb-4 font-bold">Kategori Diskusi</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-3 lg:pb-0 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-label-md transition-colors text-left w-full whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "bg-surface hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Discussions Stream */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Cari topik diskusi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md shadow-inner transition-colors"
            />
          </div>

          {/* Create Thread Trigger */}
          {user ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Buat Diskusi Baru
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-outline text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition-all text-center"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              Login Untuk Diskusi
            </Link>
          )}
        </div>

        {/* Discussions List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-16 text-center shadow-inner">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">forum</span>
            <h4 className="font-title-lg text-on-surface font-bold mb-1">Belum Ada Diskusi</h4>
            <p className="text-on-surface-variant text-sm">
              Tidak ada diskusi yang cocok dengan kriteria filter pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-primary/50 transition-all flex flex-col gap-3 group relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold">
                      {post.category}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Oleh: <span className="font-bold text-on-surface">
                        {post.isAnonymous ? (post.authorId === user?.userId ? "Anonim (Anda)" : "Anonim") : post.authorName}
                      </span>
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-semibold">
                    {new Date(post.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <Link href={`/forum/${post.id}`} className="block">
                  <h4 className="font-title-lg text-title-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug mb-1">
                    {post.title}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                </Link>

                <div className="flex items-center gap-4 text-on-surface-variant border-t border-outline-variant/20 pt-3 mt-1">
                  <Link
                    href={`/forum/${post.id}`}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors text-xs font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                    <span>{post.repliesCount} Balasan</span>
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="material-symbols-outlined text-[18px] text-red-500 fill-red-500">favorite</span>
                    <span>{post.likes} Suka</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Thread Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl overflow-hidden flex flex-col">
              <header className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Buat Diskusi Baru</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </header>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4 flex-1 overflow-y-auto">
                {error && (
                  <div className="p-3 bg-error-container/10 border border-error/20 text-error rounded-xl text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Judul Diskusi</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Info lowongan magang Teknik Informatika semester ini..."
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl p-3 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl p-3 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                  >
                    {formCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Isi Diskusi</label>
                  <textarea
                    required
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan pertanyaan, informasi, atau topik yang ingin didiskusikan secara mendetail..."
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl p-3 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 pb-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="isAnonymous" className="text-xs font-semibold text-on-surface-variant cursor-pointer select-none">
                    Post secara Anonim (Nama Anda tidak akan terlihat oleh pengguna lain)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Mengirim..." : "Kirim Diskusi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
