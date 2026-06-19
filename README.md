# 🎒 Lapak Jas Merah
> **Platform Marketplace & Forum Diskusi Khusus Mahasiswa Universitas Muhammadiyah Malang (UMM)**

Lapak Jas Merah adalah platform marketplace berbasis web yang dirancang khusus untuk memfasilitasi transaksi jual-beli, barter, penyewaan jasa, dan sistem lelang antar mahasiswa UMM secara aman, mudah, dan terintegrasi. Dilengkapi dengan forum diskusi mahasiswa dan fitur verifikasi identitas resmi (KTM) untuk menjamin keamanan transaksi di dalam lingkungan kampus.

---

## 🚀 Fitur Utama

### 🔐 Autentikasi & Verifikasi Mahasiswa
* **Registrasi & Login**: Sistem masuk menggunakan kredensial akun mahasiswa.
* **Verifikasi KTM (Kartu Tanda Mahasiswa)**: Proses upload KTM untuk verifikasi NIM dan Fakultas oleh Admin demi meminimalkan penipuan.

### 🛒 Marketplace Multi-Modus
* **Beli (Sale)**: Transaksi jual-beli konvensional dengan COD (Cash on Delivery) di area kampus.
* **Barter**: Fitur pertukaran barang dengan opsi mencantumkan barang yang diinginkan pembeli.
* **Jasa (Service)**: Penawaran jasa akademis maupun non-akademis antar mahasiswa.
* **Lelang (Auction)**: Fitur lelang barang dengan penetapan harga awal (*starting bid*), penawaran (*bidding*), dan batas waktu lelang.

### 💬 Fitur Interaksi & Komunitas
* **Chat Real-time**: Fitur chat langsung antara pembeli dan penjual yang terintegrasi dengan konteks produk yang ditanyakan.
* **Forum Diskusi**: Ruang diskusi mahasiswa berdasarkan kategori minat untuk berbagi informasi atau info produk.
* **Item Request**: Fitur bagi pembeli untuk meminta atau mencari barang tertentu yang mereka butuhkan.

### 📈 Panel Penjual (Seller Dashboard)
* **Manajemen Produk**: Tambah, edit, dan hapus listing produk.
* **Analitik Sederhana**: Grafik performa penjualan dan statistik pengunjung.
* **Auto-Bump**: Fitur menyundul produk secara otomatis pada interval tertentu agar tetap berada di halaman atas.
* **Manajemen Pesanan**: Memantau status transaksi COD dan pembayaran.

### 🛡️ Panel Admin (Admin Dashboard)
* **Moderasi Produk & User**: Blokir atau hapus produk dan akun yang melanggar aturan.
* **Verifikasi KTM**: Memproses antrean verifikasi KTM mahasiswa.
* **Penanganan Laporan (Reports)**: Menindaklanjuti laporan produk bermasalah atau penipuan dari pengguna.
* **Kelola FAQ & Kebijakan**: Menyediakan pusat bantuan bagi pengguna.

---

## 🛠️ Tech Stack

* **Frontend & Backend**: [Next.js](https://nextjs.org/) (App Router, Turbopack) & [React](https://react.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on [Supabase](https://supabase.com/))
* **Database ORM**: [Prisma Client](https://www.prisma.io/)
* **Authentication & Security**: JWT (`jose`, `jsonwebtoken`) & `bcrypt`
* **Testing**: [Vitest](https://vitest.dev/) (Unit/Component Testing) & [Playwright](https://playwright.dev/) (End-to-End Testing)

---

## 📂 Struktur Proyek

```bash
lapak-jas-merah/
├── app/                  # Next.js App Router (Halaman & Routing)
│   ├── actions/          # Server Actions untuk operasi database & logic
│   ├── admin/            # Dashboard Admin & halaman kelola data
│   ├── api/              # API Endpoints (Auth, Health check, dll)
│   ├── chat/             # Fitur Inbox & Chat Room
│   ├── login/            # Halaman Login
│   ├── register/         # Halaman Registrasi
│   ├── marketplace/      # List Produk, Detail, Transaksi, & Item Requests
│   ├── seller/           # Panel Penjual (Analitik, Produk, Pesanan)
│   └── globals.css       # Style global Tailwind
├── components/           # Reusable UI Components
├── lib/                  # Konfigurasi library (Prisma instance, utility functions)
├── prisma/               # Skema Prisma & skrip seeding database
├── public/               # Asset statis (Gambar, Icon, Logo)
├── tests/                # Unit Testing menggunakan Vitest
└── tests-e2e/            # E2E Testing menggunakan Playwright
```

---

## 🏁 Memulai Pengembangan

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda.

### 1. Kloning Repository
```bash
git clone https://github.com/username/lapak-jas-merah.git
cd lapak-jas-merah
```

### 2. Instalasi Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env` pada root direktori dan sesuaikan konfigurasinya seperti berikut:
```env
DATABASE_URL="postgresql://username:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://username:password@host:port/database"
JWT_SECRET="isi-dengan-string-secret-key-anda"

# Opsional untuk Seed Admin Default
ADMIN_EMAIL="admin@webmail.umm.ac.id"
ADMIN_PASSWORD="password123"
```

### 4. Sinkronisasi Database & Seeding
Lakukan sinkronisasi skema Prisma ke database Supabase dan jalankan seed untuk membuat data admin awal:
```bash
# Sinkronisasi Skema
npx prisma db push --force-reset

# Menjalankan Seeding
npx prisma db seed
```

### 5. Jalankan Server Lokal
Jalankan server dalam mode development:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat hasilnya.

---

## 🧪 Pengujian (Testing)

Proyek ini telah dikonfigurasi dengan pengujian untuk memastikan kestabilan kode:

* **Menjalankan Unit & Integration Test (Vitest)**:
  ```bash
  npm run test
  ```
* **Menjalankan End-to-End Test (Playwright)**:
  ```bash
  npx playwright test
  ```

---

## 🧑‍💻 Kontributor
* **Tim RPL Semester 4** - *Universitas Muhammadiyah Malang (UMM)*
