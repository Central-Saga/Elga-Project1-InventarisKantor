# Panduan Login per Role — Inventaris Kantor

Dokumentasi akun login untuk pengujian lokal aplikasi **Inventaris Kantor & ATK**.

> **Lingkup verifikasi:** Informasi berikut merujuk kode pada branch `main` repository GitHub. Branch lokal `issue-1-frontend` memiliki perubahan yang belum di-commit, sehingga perilaku aplikasi lokal dapat berbeda.
>
> **Keamanan:** Akun dan password di bawah adalah **akun demo pengembangan**, bukan kredensial untuk aplikasi produksi. Jangan gunakan password demo di deployment publik.

## 1. Alamat Aplikasi

| Komponen | Alamat lokal | Keterangan |
|---|---|---|
| Halaman login | http://localhost:3000/login | Frontend Next.js |
| API login | http://127.0.0.1:8000/api/v1/login | Backend Laravel |
| Database | PostgreSQL | Harus aktif dan terhubung dengan Laravel |

Halaman login mengirimkan **email** dan **password** ke API Laravel. Jika berhasil, pengguna diarahkan ke dashboard berdasarkan `role`.

## 2. Akun Login Berdasarkan Role

Akun ini didefinisikan di `backend/database/seeders/DatabaseSeeder.php` pada branch `main`.

| Role | Nama pengguna demo | Email | Password demo | Dashboard setelah login |
|---|---|---|---|---|
| **Admin** (`admin`) | Admin Inventaris | `admin@example.com` | `password` | `/admin/dashboard` |
| **Employee / User** (`employee`) | Budi Santoso | `budi@example.com` | `password` | `/user/dashboard` |

**Catatan:** Akun tersebut tersedia hanya bila `DatabaseSeeder` pernah dijalankan pada **database yang sedang digunakan** aplikasi, atau akun yang sama dibuat dengan cara lain. Isi database lokal dapat berbeda dari source code.

## 3. Cara Login sebagai Admin

1. Pastikan PostgreSQL, backend Laravel, dan frontend Next.js aktif.
2. Buka http://localhost:3000/login.
3. Isi email: `admin@example.com`.
4. Isi password: `password`.
5. Klik **Masuk ke Sistem**.
6. Jika autentikasi berhasil dan role `admin`, aplikasi mengarahkan ke **http://localhost:3000/admin/dashboard**.

### Verifikasi Admin

- Login berhasil tanpa pesan kesalahan.
- Dashboard admin tampil.
- Fitur khusus admin hanya boleh dapat digunakan oleh pengguna yang memang memiliki izin; pembatasan harus ditegakkan di backend, bukan hanya dari menu yang tampil.

## 4. Cara Login sebagai Employee / User

1. Buka http://localhost:3000/login.
2. Isi email: `budi@example.com`.
3. Isi password: `password`.
4. Klik **Masuk ke Sistem**.
5. Jika autentikasi berhasil dan role `employee`, aplikasi mengarahkan ke **http://localhost:3000/user/dashboard**.

### Verifikasi Employee

- Login berhasil tanpa pesan kesalahan.
- Dashboard user tampil.
- Akses terhadap aksi administratif perlu diuji agar role `employee` tidak memperoleh hak admin.

## 5. Ringkasan Alur Login

```text
Pengguna membuka /login
        |
        v
Input email dan password
        |
        v
POST /api/v1/login (Laravel)
        |
        +-- Gagal --> Tampilkan pesan kesalahan
        |
        +-- Berhasil --> API mengirim token dan data user (termasuk role)
                              |
                              +-- admin    --> /admin/dashboard
                              |
                              +-- employee --> /user/dashboard
```

Pada implementasi frontend branch `main`, token akses dan informasi pengguna disimpan melalui `localStorage`. Endpoint API login menggunakan Laravel Sanctum untuk menghasilkan bearer token.

## 6. Jika Login Gagal

| Gejala | Pemeriksaan pertama |
|---|---|
| `Email atau password salah` / `Kredensial ... salah` | Pastikan email dan password benar serta akun sudah ada di database aktif. |
| Gagal terhubung ke API | Pastikan backend Laravel aktif di `127.0.0.1:8000` dan koneksi frontend–backend tidak diblokir. |
| Halaman frontend menampilkan `Build Error` | Perbaiki build Next.js dahulu; error `lightningcss.linux-x64-gnu.node` bukan masalah kredensial login. |
| Login berhasil tetapi dashboard tidak tampil | Periksa log frontend, respons API, dan perubahan lokal pada route atau redirect. |
| Kedua akun demo tidak dikenali | Periksa apakah `DatabaseSeeder` telah digunakan di database yang benar. |

### Pemeriksaan seeder (WSL)

Dari root proyek, file seed demo berada pada:

```text
backend/database/seeders/DatabaseSeeder.php
```

Perintah Laravel untuk menjalankan seeder adalah:

```bash
cd /mnt/c/Users/USER/inventaris-kantor-dan-atk/backend
php artisan db:seed --class=DatabaseSeeder
```

**Jangan jalankan perintah seed secara sembarangan:** `DatabaseSeeder` yang diverifikasi juga memanggil `InventorySeeder`, dan akun demo diperbarui melalui `updateOrCreate`, termasuk password-nya. Pada database yang berisi data penting, periksa dampaknya dan buat cadangan terlebih dahulu.

## 7. Checklist Screenshot Dokumentasi

- [ ] Screenshot halaman **Login**.
- [ ] Screenshot **Admin Dashboard** setelah login akun admin.
- [ ] Screenshot **User Dashboard** setelah login akun employee.
- [ ] Screenshot fitur inventaris/ATK sesuai hak akses masing-masing role.
- [ ] Pastikan tidak ada password, token, informasi pribadi, atau data kantor sensitif pada screenshot.

## 8. Referensi Source Code

- [DatabaseSeeder.php — akun demo](https://github.com/Central-Saga/Elga-Project1-InventarisKantor/blob/main/backend/database/seeders/DatabaseSeeder.php)
- [Frontend Login — validasi dan redirect role](https://github.com/Central-Saga/Elga-Project1-InventarisKantor/blob/main/frontend/src/app/login/page.tsx)
- [AuthController.php — autentikasi API](https://github.com/Central-Saga/Elga-Project1-InventarisKantor/blob/main/backend/app/Http/Controllers/Api/AuthController.php)
- [routes/api.php — endpoint login](https://github.com/Central-Saga/Elga-Project1-InventarisKantor/blob/main/backend/routes/api.php)

---

**Tujuan dokumen:** Referensi pengujian login menurut role pada lingkungan pengembangan lokal; bukan daftar kredensial produksi.
