"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Tanya Umum");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/45 rounded-2xl p-8 shadow-sm">
      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
            Pesan Terkirim!
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto mb-6">
            Terima kasih telah menghubungi kami. Tim Lapak Jas Merah akan meninjau pesan Anda dan segera merespons melalui email resmi UMM Anda.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="border border-primary text-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:bg-primary/5 transition-colors font-semibold cursor-pointer"
          >
            Kirim Pesan Lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold" htmlFor="name">
              Nama Lengkap
            </label>
            <input
              id="name"
              required
              type="text"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 font-body-md text-body-md"
              placeholder="Masukkan nama lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold" htmlFor="email">
              Email UMM (@webmail.umm.ac.id)
            </label>
            <input
              id="email"
              required
              type="email"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 font-body-md text-body-md"
              placeholder="nim@webmail.umm.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold" htmlFor="subject">
              Kategori Subjek
            </label>
            <select
              id="subject"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md text-on-surface"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Tanya Umum">Pertanyaan Umum</option>
              <option value="Laporan Penipuan">Laporan Penipuan / Keamanan</option>
              <option value="Masalah Akun / KTM">Masalah Verifikasi Akun &amp; KTM</option>
              <option value="Bug / Error Teknis">Bug &amp; Masalah Teknis Sistem</option>
              <option value="Kritik &amp; Saran">Kritik &amp; Saran Pengguna</option>
            </select>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold" htmlFor="message">
              Pesan Detail
            </label>
            <textarea
              id="message"
              required
              rows={4}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40 font-body-md text-body-md"
              placeholder="Jelaskan secara rinci pertanyaan, keluhan, atau laporan Anda..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg hover:bg-primary/95 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 font-bold cursor-pointer"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </form>
      )}
    </div>
  );
}
