"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createForumReplyAction } from "@/app/actions/forum";

interface ReplyFormProps {
  postId: string;
}

export default function ReplyForm({ postId }: ReplyFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("content", content);

    try {
      const res = await createForumReplyAction(postId, null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.validationErrors) {
        setError(Object.values(res.validationErrors).join(", "));
      } else {
        setContent("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim balasan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="font-title-lg text-body-lg font-bold text-on-surface">Tulis Balasan Anda</h4>
      {error && (
        <div className="p-3 bg-error-container/10 border border-error/20 text-error rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}
      <textarea
        required
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tuliskan komentar atau tanggapan Anda mengenai topik ini..."
        className="w-full bg-surface border border-outline-variant/50 rounded-xl p-3.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        >
          {submitting ? "Mengirim..." : "Kirim Balasan"}
        </button>
      </div>
    </form>
  );
}
