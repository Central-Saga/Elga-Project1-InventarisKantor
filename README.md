# Inventaris Kantor & ATK

> Aplikasi internal untuk mengelola inventaris aset kantor, persediaan ATK, transaksi dan peminjaman aset. **Dokumentasi setup developer** untuk repository `Central-Saga/Elga-Project1-InventarisKantor`.

![Tampilan login Inventaris Kantor](docs/screenshots/login.png)

## Isi dokumentasi

- [Gambaran sistem](#gambaran-sistem)
- [Teknologi & struktur direktori](#teknologi--struktur-direktori)
- [Persiapan](#persiapan)
- [Menjalankan lokal](#menjalankan-lokal)
- [Pengujian akun demo](#pengujian-akun-demo)
- [Screenshot aplikasi](#screenshot-aplikasi)
- [Troubleshooting](#troubleshooting)
- [Catatan keamanan](#catatan-keamanan)

## Gambaran sistem

Sistem terbagi menjadi dua aplikasi: backend Laravel menyediakan API dan pengaturan akses; frontend Next.js menyajikan antarmuka untuk dua peran utama.

| Role | Area dan tugas utama |
|---|---|
| **Admin** | Dashboard, pengelolaan aset, ATK, pengguna, peminjaman, permintaan ATK, serta histori transaksi |
| **User / Employee** | Dashboard pengguna, melihat aset/ATK, mengajukan peminjaman, mengirim permintaan ATK, dan melihat riwayat pengajuan |

**Alur singkat:** pengguna login → frontend mengirim permintaan ke API Laravel → Laravel memeriksa identitas/role → PostgreSQL menyimpan data dan transaksi → frontend menampilkan hasil sesuai hak akses.

> Daftar fitur ini disusun dari struktur halaman dan controller proyek yang telah diperiksa selama pengembangan. Status operasi spesifik tetap perlu diuji pada versi branch yang hendak digabung.

## Teknologi & struktur direktori

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Laravel (PHP), API |
| Database | PostgreSQL |
| Lokal | Docker Compose untuk database; Laravel dan Next.js dapat dijalankan terpisah |
| Autentikasi | Login berbasis email/password dengan pembatasan role pada API |

```text
inventaris-kantor-dan-atk/
├── backend/                 # Laravel API, migration, seeder, controller
│   ├── app/Http/Controllers/Api/
│   ├── database/seeders/
│   └── docker-compose.yml   # Compose alternatif; jangan jalankan bersama tanpa cek port
├── frontend/                # Next.js dan halaman Admin/User
│   └── src/app/
├── compose.yaml             # Docker Compose di root
└── README.md
```

## Persiapan

- Git.
- Docker Desktop dengan integrasi WSL aktif, atau instalasi Docker yang mendukung `docker compose`.
- PHP versi sesuai `backend/composer.json` (Laravel 12 umumnya membutuhkan PHP >= 8.2), termasuk ekstensi PostgreSQL (`pdo_pgsql`), serta Composer.
- Node.js dan npm versi yang mendukung versi Next.js pada `frontend/package.json`.
- WSL Ubuntu **direkomendasikan** untuk pengembangan di Linux; simpan kode di filesystem Linux (`~/projects`) bila ingin performa lebih baik.

> Perintah di bawah diasumsikan dijalankan di WSL/bash. Jika menggunakan PowerShell, sesuaikan perintah copy environment dan aktivasi layanan.

## Menjalankan lokal

### 1. Clone dan siapkan konfigurasi

```bash
git clone https://github.com/Central-Saga/Elga-Project1-InventarisKantor.git
cd Elga-Project1-InventarisKantor
```

Siapkan environment **tanpa meng-commit rahasia**. Pertahankan file `.env.example` bawaan jika sudah tersedia, dan periksa variabel yang benar-benar dibaca oleh frontend pada `frontend/src/lib/api.ts` serta file terkait.

```bash
# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
cd ..

# Frontend
cd frontend
cp .env.example .env.local
npm ci --include=optional
cd ..
```

Repository sudah menyediakan `backend/.env.example`. Gunakan file tersebut sebagai dasar konfigurasi dan sesuaikan nilai database dengan service Docker Compose yang digunakan.

### 2. Menyalakan PostgreSQL dengan Docker

Jalankan dari **root repository**:

```bash
docker compose -f compose.yaml config --services
docker compose -f compose.yaml up -d
docker compose -f compose.yaml ps
```

Periksa nama service serta pemetaan port sebelum meneruskan. Compose di root telah digunakan untuk database pada pengembangan lokal; **jangan mengasumsikan** bahwa perintah ini otomatis menjalankan Laravel dan Next.js.

Untuk menemukan port PostgreSQL yang diekspos ke host:

```bash
docker compose -f compose.yaml ps
```

Contohnya pemetaan `0.0.0.0:5432->5432/tcp` berarti `DB_HOST=127.0.0.1` dan `DB_PORT=5432` **jika Laravel dijalankan langsung dari WSL/host**. Jika Laravel dijalankan **di dalam Docker Compose yang satu network**, gunakan nama service PostgreSQL dan port internal `5432` sebagai gantinya.

> **Penting:** `backend/docker-compose.yml` merupakan konfigurasi lain; jangan menjalankan kedua Compose secara bersamaan tanpa memeriksa nama container, jaringan, volume, dan port.

### 3. Konfigurasi PostgreSQL Laravel

Periksa `backend/.env`, khususnya:

```dotenv
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=inventaris_kantor
DB_USERNAME=inventaris_user
DB_PASSWORD=ISI_PASSWORD_LOKAL
```

Nilai `DB_DATABASE`, `DB_USERNAME`, dan password **harus sesuai database yang benar-benar dibuat oleh Compose**. Contoh di atas bukan kredensial yang pasti bekerja. Hindari memakai password yang tersimpan di repositori atau memasukkan password asli ke README.

Untuk **database development baru yang kosong** saja, setelah koneksi benar:

```bash
cd backend
php artisan migrate
# Opsional: lihat dan pilih seeder demo yang memang tersedia,
# baru jalankan pada database development, JANGAN production.
# php artisan db:seed
```

Jika aplikasi sudah memiliki data, **jangan menjalankan** `migrate:fresh`, `db:wipe`, `down -v`, atau seeding ulang sembarangan.

### 4. Menjalankan backend Laravel

Di terminal WSL **pertama**:

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

Alamat API: `http://127.0.0.1:8000`. Endpoint login yang pernah digunakan oleh frontend adalah `/api/v1/login` sehingga target lokalnya `http://127.0.0.1:8000/api/v1/login`.

### 5. Menjalankan frontend Next.js

Di terminal WSL **kedua**:

```bash
cd frontend
npm run dev
```

Buka **http://localhost:3000/login**. Jalankan backend dan database juga agar autentikasi bekerja, bukan sekadar halaman login tampil.

### 6. Validasi akhir

- [ ] Docker PostgreSQL running, tanpa bentrok port dengan aplikasi lain.
- [ ] Backend Laravel berjalan pada port 8000.
- [ ] Halaman `http://localhost:3000/login` tampil tanpa build error.
- [ ] Login Admin mengarah ke halaman `/admin/dashboard`.
- [ ] Login User mengarah ke halaman `/user/dashboard`.
- [ ] Navigasi dan pemanggilan API bekerja tanpa HTTP 500/connection refused.

## Pengujian akun demo

Untuk pengembangan lokal, informasi seeder yang pernah diperiksa pada proyek ini menunjukkan contoh berikut:

| Role | Email demo | Password demo | Tujuan |
|---|---|---|---|
| Admin | `admin@example.com` | `password` | `/admin/dashboard` |
| Employee / User | `budi@example.com` | `password` | `/user/dashboard` |

**Akun tidak otomatis ada setelah clone.** Data demo hanya tersedia apabila seeder yang sesuai telah dijalankan; cek `backend/database/seeders/DatabaseSeeder.php` untuk memastikan. Password contoh harus diganti untuk penggunaan selain development lokal. Jika versi seeder sudah berubah, utamakan isi seeder saat ini.

Detail uji login: [docs/LOGIN_PER_ROLE.md](docs/LOGIN_PER_ROLE.md).

## Screenshot aplikasi

### Login

![Login Inventaris Kantor](docs/screenshots/login.png)

### Admin dan User

Halaman berikut perlu diambil dari aplikasi yang sedang berjalan setelah login (jangan gunakan screenshot aplikasi atau repository lain):

| Screenshot yang disarankan | Halaman |
|---|---|
| Admin dashboard | `/admin/dashboard` |
| Manajemen aset | `/admin/assets` |
| Manajemen ATK | `/admin/atk` |
| Pengajuan dan peminjaman | `/admin/atk-requests`, `/admin/loans` |
| User dashboard | `/user/dashboard` |
| Halaman peminjaman User | `/user/loans` |

Simpan gambar tambahan di `docs/screenshots/` dan tautkan secara relatif dari README. Lihat [panduan screenshot](docs/SCREENSHOT_GUIDE.md).

## Troubleshooting

| Kendala | Penanganan |
|---|---|
| `ERR_CONNECTION_REFUSED` saat login ke port 8000 | Pastikan `php artisan serve` hidup dan konfigurasi base URL API frontend menunjuk backend yang aktif |
| `Could not translate host name` / `pgsql` tidak dikenal | `pgsql` lazimnya nama service Docker; jika backend dijalankan dari WSL/host, gunakan `127.0.0.1` dan port PostgreSQL yang diekspos |
| `Cannot find module lightningcss.linux-x64-gnu.node` | Dependency native Windows/Linux tercampur. Instal `npm ci --include=optional` dari lingkungan yang konsisten. Jika masih gagal, periksa optional dependency native tanpa mengganti source atau lockfile sembarangan |
| Port 3000/8000/5432 sudah dipakai | Periksa `docker compose ps`, `ss -ltnp`, atau `docker ps`; jangan mematikan container lain tanpa memastikan miliknya |
| `php: command not found` | Pasang PHP CLI dan ekstensi Laravel di WSL, atau jalankan Laravel dari container yang memang menyediakan PHP |
| Login menolak password demo | Pastikan akun benar-benar ada di database dan seeder yang sesuai sudah dijalankan |
| `npm run dev` lambat di WSL `/mnt/c/` | Untuk tool Linux, simpan repository di filesystem Linux dan buka melalui VS Code WSL |

## Catatan keamanan

- Jangan commit `.env`, `.env.local`, token, password, connection string asli, atau private key.
- Jangan gunakan password contoh pada aplikasi publik.
- Terapkan otorisasi per role di backend, bukan hanya menyembunyikan menu frontend.
- Pakai database terpisah untuk test dan development.
- Review perubahan dan test sebelum merge Pull Request.

## Kontribusi dan Issue

Repository: [Central-Saga/Elga-Project1-InventarisKantor](https://github.com/Central-Saga/Elga-Project1-InventarisKantor).

Dokumentasi ini disiapkan untuk **Issue #34 — README lengkap + `.env.example` + cara run**. Sebelum mengajukan PR, verifikasi ulang konfigurasi aktual pada branch sasaran dan tambahkan screenshot dashboard agar acceptance criteria screenshot lebih lengkap.
