"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteButtonProps {
  id: string;
  type: "post" | "reply";
  action: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

export default function DeleteButton({ id, type, action }: DeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      type === "post"
        ? "Apakah Anda yakin ingin menghapus diskusi ini? Tindakan ini tidak dapat dibatalkan."
        : "Apakah Anda yakin ingin menghapus balasan ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await action(id);
      if (res.error) {
        alert(res.error);
      } else if (res.success) {
        if (type === "post") {
          router.push("/forum");
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-error hover:text-error/80 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer font-bold text-xs bg-transparent border-none py-1 px-2 rounded-lg hover:bg-error-container/10"
      title={type === "post" ? "Hapus Diskusi" : "Hapus Balasan"}
    >
      <span className="material-symbols-outlined text-[18px]">delete</span>
      <span>{deleting ? "Menghapus..." : "Hapus"}</span>
    </button>
  );
}
