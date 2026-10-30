# Dokumentasi Kontrak API Inventaris Kantor & ATK (/api/v1)

Dokumentasi ini menyediakan spesifikasi lengkap untuk seluruh endpoint REST API di bawah prefix `/api/v1`.

Spesifikasi OpenAPI 3.0 juga tersedia di [docs/openapi.yaml](openapi.yaml).

---

## 1. Konvensi Format Response

Semua respon API menggunakan standard format envelope:

### Respon Sukses (200 / 201)
```json
{
  "success": true,
  "message": "Operasi berhasil dijalankan.",
  "data": { ... }
}
```

### Respon Error Validasi (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "Data yang dikirimkan tidak valid.",
  "data": null,
  "errors": {
    "email": ["Email wajib diisi."]
  }
}
```

### Respon Error Autentikasi / Otorisasi (401 / 403)
```json
{
  "success": false,
  "message": "Unauthenticated.",
  "data": null,
  "errors": null
}
```

---

## 2. Autentikasi

### `POST /api/v1/login`
Autentikasi akun dan mendapatkan Sanctum Bearer Token.

* **Rate Limit:** 5 request / menit
* **Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```
* **Contoh cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### `POST /api/v1/logout`
Revoke bearer token aktif pengguna.
* **Header:** `Authorization: Bearer <TOKEN>`

---

## 3. Ringkasan Endpoint

| Method | Endpoint | Hak Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/login` | Publik | Login & generate token |
| `POST` | `/api/v1/logout` | Authenticated | Logout & hapus token |
| `GET` | `/api/v1/user` | Authenticated | Profil user saat ini |
| `GET` | `/api/v1/assets` | Authenticated | List aset inventaris |
| `POST` | `/api/v1/assets` | Admin | Buat aset baru |
| `GET` | `/api/v1/assets/{id}` | Authenticated | Detail aset |
| `PUT` | `/api/v1/assets/{id}` | Admin | Update aset |
| `DELETE`| `/api/v1/assets/{id}` | Admin | Hapus aset |
| `GET` | `/api/v1/categories` | Authenticated | Kategori aset & ATK |
| `GET` | `/api/v1/atks` | Authenticated | List persediaan ATK |
| `POST` | `/api/v1/atks` | Admin | Tambah item ATK |
| `POST` | `/api/v1/atks/{id}/add-stock` | Admin | Tambah stok item ATK |
| `GET` | `/api/v1/loans` | Authenticated | Riwayat peminjaman |
| `POST` | `/api/v1/loans` | Authenticated | Pengajuan peminjaman aset |
| `PATCH`| `/api/v1/loans/{id}/status` | Admin | Setujui / tolak peminjaman |
| `POST` | `/api/v1/loans/{id}/return-request` | Authenticated | Ajukan pengembalian aset |
| `POST` | `/api/v1/loans/{id}/return` | Admin | Konfirmasi aset kembali |
| `GET` | `/api/v1/atk-requests` | Authenticated | List permintaan ATK |
| `POST` | `/api/v1/atk-requests` | Authenticated | Ajukan permintaan ATK |
| `PATCH`| `/api/v1/atk-requests/{id}/status` | Admin | Setujui / tolak permintaan ATK |
| `GET` | `/api/v1/transaction-history` | Admin | Log riwayat transaksi gabungan |
| `GET` | `/api/v1/users` | Admin | List user |
| `POST` | `/api/v1/users` | Admin | Tambah user baru |
| `PUT` | `/api/v1/users/{id}` | Admin | Update profil user |
| `DELETE`| `/api/v1/users/{id}` | Admin | Hapus user |

