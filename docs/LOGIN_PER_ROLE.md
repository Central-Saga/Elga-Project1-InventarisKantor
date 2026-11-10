# Login Per Role — Inventaris Kantor

Aplikasi memiliki dua peran: **Admin** dan **Employee / User**.

| Role | Email contoh seeder | Password seeder | Dashboard |
|---|---|---|---|
| Admin | `admin@example.com` | `password` | `/admin/dashboard` |
| Employee | `budi@example.com` | `password` | `/user/dashboard` |

Akun dibuat oleh `DatabaseSeeder` saat langkah setup menjalankan `php artisan migrate --seed`. Jika hanya migrasi yang dijalankan, akun demo belum tersedia. Periksa source `backend/database/seeders/DatabaseSeeder.php` pada branch saat ini. Jangan publikasikan kredensial akun nyata.

> Akun dan password tersebut hanya untuk database development lokal. Jangan gunakan pada production atau layanan publik. Seeder juga membuat/memperbarui data inventaris contoh.

## Uji login

1. Jalankan PostgreSQL dan pastikan konfigurasi `backend/.env` sesuai dengan `compose.yaml`.
2. Untuk database development lokal yang baru dan kosong, dari folder `backend` jalankan `php artisan migrate --seed`. Jangan jalankan seeder pada database production atau database bersama.
3. Jalankan Laravel pada port 8000 dan Next.js pada port 3000.
4. Buka `http://localhost:3000/login`.
5. Uji Admin. Pastikan sidebar/menu dan hak akses Admin sesuai.
6. Logout kemudian uji Employee. Pastikan halaman yang membutuhkan role Admin ditolak dari role Employee.
7. Jangan menyimpan email/password asli pada screenshot.

## Masalah umum

- Browser melaporkan `127.0.0.1:8000` **connection refused**: backend belum aktif.
- API memberikan **401**: cek kredensial dan sesi login.
- API memberikan **403**: cek otorisasi role.
- Error database: periksa koneksi Laravel dan port PostgreSQL.
