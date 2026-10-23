# Login Per Role — Inventaris Kantor

Aplikasi memiliki dua peran: **Admin** dan **Employee / User**.

| Role | Email contoh seeder | Password seeder | Dashboard |
|---|---|---|---|
| Admin | `admin@example.com` | `password` | `/admin/dashboard` |
| Employee | `budi@example.com` | `password` | `/user/dashboard` |

Akun hanya tersedia jika `DatabaseSeeder` yang sesuai benar-benar dijalankan. Periksa source `backend/database/seeders/DatabaseSeeder.php` pada branch saat ini. Jangan publikasikan kredensial akun nyata.

## Uji login

1. Jalankan PostgreSQL, Laravel pada port 8000, Next.js pada port 3000.
2. Buka `http://localhost:3000/login`.
3. Uji Admin. Pastikan sidebar/menu dan hak akses Admin sesuai.
4. Logout kemudian uji Employee. Pastikan halaman yang membutuhkan role Admin ditolak dari role Employee.
5. Jangan menyimpan email/password asli pada screenshot.

## Masalah umum

- Browser melaporkan `127.0.0.1:8000` **connection refused**: backend belum aktif.
- API memberikan **401**: cek kredensial dan sesi login.
- API memberikan **403**: cek otorisasi role.
- Error database: periksa koneksi Laravel dan port PostgreSQL.
