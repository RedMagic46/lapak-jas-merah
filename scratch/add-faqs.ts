import { PrismaClient } from "@prisma/client";

// Use DIRECT_URL for direct script connection if available
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

const FAQS_TO_ADD = [
  {
    question: "Bagaimana cara mengubah profil saya?",
    answer: "Anda dapat membuka menu pengaturan akun (melalui ikon profil di kanan atas) untuk mengedit nama lengkap, pilihan fakultas, maupun foto profil Anda."
  },
  {
    question: "Di mana saya bisa melakukan Cash on Delivery (COD) dengan aman?",
    answer: "Kami menyarankan Anda bertemu di area Safe Zone Kampus UMM, seperti area Helipad, halaman Masjid AR Fachruddin, depan GKB 1, atau Gazebo Danau UMM yang ramai dan terpantau CCTV."
  },
  {
    question: "Bagaimana jika barang yang saya terima tidak sesuai deskripsi?",
    answer: "Selalu periksa kondisi barang dengan teliti saat melakukan COD sebelum membayar. Jika terjadi penipuan atau ketidaksesuaian yang disengaja, segera gunakan tombol 'Laporkan' pada profil penjual atau detail produk."
  },
  {
    question: "Apakah saya bisa membatalkan penawaran lelang yang sudah dikirim?",
    answer: "Tidak, setiap penawaran (bid) lelang bersifat mengikat secara sistem. Jika Anda memenangkan lelang dan menolak membayar, reputasi akun Anda dapat dinilai buruk dan berisiko ditangguhkan oleh admin."
  },
  {
    question: "Bagaimana cara menaikkan (bump) produk jualan saya?",
    answer: "Anda dapat masuk ke panel penjual (Seller Panel), buka daftar produk, lalu aktifkan fitur Auto-Bump untuk menaikkan posisi produk Anda ke bagian atas pencarian secara berkala."
  }
];

async function main() {
  console.log("Menambahkan 5 data FAQ baru ke database...");

  let count = 0;
  for (const item of FAQS_TO_ADD) {
    // Check if it already exists to avoid duplicates
    const existing = await prisma.fAQ.findFirst({
      where: { question: item.question }
    });

    if (!existing) {
      await prisma.fAQ.create({
        data: item
      });
      console.log(`Berhasil menambahkan FAQ: "${item.question}"`);
      count++;
    } else {
      console.log(`FAQ sudah ada, dilewati: "${item.question}"`);
    }
  }

  console.log(`Selesai! Berhasil menambahkan ${count} FAQ baru.`);
}

main()
  .catch((e) => {
    console.error("Terjadi kesalahan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
