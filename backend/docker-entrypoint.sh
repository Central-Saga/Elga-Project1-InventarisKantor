#!/bin/sh
set -e

# Bersihkan cache lama jika ada dan pastikan folder runtime storage tersedia
rm -f bootstrap/cache/*.php
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Generate APP_KEY jika belum ada di environment
if [ -z "${APP_KEY:-}" ]; then
    if [ ! -f .env ] || ! grep -q "^APP_KEY=" .env 2>/dev/null; then
        GENERATED_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
        export APP_KEY="$GENERATED_KEY"
        echo "APP_KEY=$GENERATED_KEY" >> .env
    fi
else
    if [ ! -f .env ]; then
        echo "APP_KEY=$APP_KEY" >> .env
    fi
fi

# Tunggu koneksi database PostgreSQL siap sebelum migrasi (resilient terhadap podman-compose)
echo "Menunggu koneksi database PostgreSQL ($DB_HOST:$DB_PORT)..."
php -r '
$host = getenv("DB_HOST") ?: "db";
$port = getenv("DB_PORT") ?: "5432";
$dbname = getenv("DB_DATABASE") ?: "inventaris_db";
$user = getenv("DB_USERNAME") ?: "central_user";
$pass = getenv("DB_PASSWORD") ?: "secretpassword";
$dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
$maxTries = 30;
while ($maxTries > 0) {
    try {
        new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 2, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        echo "Database PostgreSQL berhasil terhubung!\n";
        exit(0);
    } catch (Exception $e) {
        $maxTries--;
        echo "Database belum siap, mencoba lagi dalam 2 detik... (" . $maxTries . " percobaan tersisa)\n";
        sleep(2);
    }
}
echo "Gagal terhubung ke database dalam 60 detik.\n";
exit(1);
'

# Generate package discovery yang sesuai dengan vendor terinstall (--no-dev)
php artisan package:discover --ansi

# Jalankan migrasi tabel database
echo "Menjalankan migrasi database..."
php artisan migrate --force

# Jalankan seeder jika RUN_SEED diset true
if [ "${RUN_SEED:-false}" = "true" ]; then
    echo "Menjalankan database seeder (akun demo & data inventaris)..."
    php artisan db:seed --force
fi

echo "Memulai PHP-FPM dan Nginx..."
php-fpm -D
exec nginx -g 'daemon off;'
