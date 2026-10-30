# Changelog

Semua perubahan penting pada project **Inventaris Kantor & ATK** akan dicatat di file ini.

Format changelog ini mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.1.0/)
dan project ini menganut [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Integrasi kontainerisasi Podman Compose (`podman compose` dan `podman-compose`) dengan jaringan bridge terisolasi `inventaris-net`.
- Script inisialisasi startup kontainer backend (`backend/docker-entrypoint.sh`) dengan mekanisme aktif pengecekan kesiapan PostgreSQL (active PDO wait-loop).
- Template environment terpusat `.env.example` dan `.env` pada root direktori project.
- CI/CD workflow GitHub Actions (`.github/workflows/ci.yml`) untuk pengujian otomatis backend (PHPUnit) dan build frontend (Next.js).
- Layer Service dan Repository untuk modularisasi logika bisnis: `AssetLoanService`, `AtkRequestService`, `AtkStockService`.
- Otentikasi berbasis token Sanctum Bearer dengan proteksi route per role (`admin` dan `employee`).
- Dokumentasi akun demo dan panduan pengetesan per role (`LOGIN_PER_ROLE_INVENTARIS_KANTOR.md`).

### Changed
- Konfigurasi `compose.yaml` dan `compose.prod.yaml` diperbarui dengan standar healthcheck yang kompatibel dengan Podman Compose dan Docker Compose.
- Standarisasi CORS origin untuk mencakup akses lokal `http://localhost:3000` dan `http://127.0.0.1:3000`.
- Konfigurasi `next.config.ts` dan Dockerfile frontend dioptimalkan untuk standalone runtime (`output: "standalone"`).

### Removed
- File boilerplate bawaan Laravel: `backend/tests/Feature/ExampleTest.php` dan `backend/tests/Unit/ExampleTest.php`.

