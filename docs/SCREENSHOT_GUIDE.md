# Panduan Screenshot Issue #34

Screenshot login yang tersedia berasal dari sesi pengembangan lokal. Screenshot dashboard lain belum disertakan dan perlu dibuat setelah login.

1. Jalankan backend dan frontend, pastikan tidak ada error browser.
2. Masuk dengan akun demo pada database development, jangan gunakan akun production.
3. Buka setiap halaman dan pastikan konten tidak memuat informasi rahasia, email personal, token, atau ID sensitif.
4. Tutup DevTools, tekan `F11` untuk fullscreen (opsional), lalu `Win + Shift + S` untuk menangkap area aplikasi.
5. Simpan sebagai `docs/screenshots/admin-dashboard.png`, `admin-assets.png`, `admin-atk.png`, `user-dashboard.png`, `user-loans.png`.
6. Tambahkan ke README menggunakan sintaks `![Admin Dashboard](docs/screenshots/admin-dashboard.png)` hanya setelah file benar-benar ada.
7. Jangan merekayasa screenshot seolah halaman sedang berjalan jika belum diuji.

Screenshot harus mencerminkan branch aplikasi yang dipakai untuk dokumentasi. Periksa bahwa nama file dan paths benar sebelum push.
