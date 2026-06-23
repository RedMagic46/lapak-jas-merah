import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import ContactForm from "./ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami - Lapak Jas Merah UMM",
  description: "Hubungi tim admin dan dukungan teknis Lapak Jas Merah Universitas Muhammadiyah Malang jika Anda memiliki pertanyaan atau kendala.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 px-container-margin md:px-[80px] border-b border-outline-variant/20">
          <div className="max-w-4xl mx-auto text-center">
            <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Dukungan
            </span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mt-4 mb-6">
              Hubungi Kami
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Kami siap membantu Anda menyelesaikan kendala akun, verifikasi KTM, lelang, atau melaporkan tindakan yang mencurigakan di dalam platform.
            </p>
          </div>
        </section>

        {/* Contact Info and Form Grid */}
        <section className="py-section-gap px-container-margin md:px-[80px] max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Info Column */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">
                  Mari Terhubung
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Jika Anda memiliki kendala teknis atau menemukan bug sistem, silakan isi formulir atau hubungi tim pengelola kami secara langsung.
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                  <div>
                    <h4 className="font-title-lg text-title-lg font-bold text-on-surface mb-1">
                      Email Dukungan
                    </h4>
                    <p className="font-body-md text-body-md text-primary hover:underline">
                      <a href="mailto:lapakjasmerah@umm.ac.id">lapakjasmerah@umm.ac.id</a>
                    </p>
                    <p className="font-body-md text-[13px] text-on-surface-variant mt-0.5">
                      Kami membalas dalam kurun waktu 24 jam di hari kerja.
                    </p>
                  </div>
                </div>

                {/* Location Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">where_to_vote</span>
                  </div>
                  <div>
                    <h4 className="font-title-lg text-title-lg font-bold text-on-surface mb-1">
                      Sekretariat Lapak
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Gedung GKB I Lantai 2, Ruang Laboratorium RPL / Informatika UMM,<br />
                      Jl. Raya Tlogomas No. 246, Malang, Jawa Timur.
                    </p>
                  </div>
                </div>

                {/* Hours Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                  </div>
                  <div>
                    <h4 className="font-title-lg text-title-lg font-bold text-on-surface mb-1">
                      Jam Operasional Desk
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Senin - Jumat: 08:00 - 16:00 WIB<br />
                      Sabtu &amp; Minggu: Libur (Layanan online berjalan terbatas)
                    </p>
                  </div>
                </div>

                {/* Social Media Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">group</span>
                  </div>
                  <div>
                    <h4 className="font-title-lg text-title-lg font-bold text-on-surface mb-1">
                      Media Sosial
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Instagram: <a href="https://instagram.com/lapakjasmerah_umm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">@lapakjasmerah_umm</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
