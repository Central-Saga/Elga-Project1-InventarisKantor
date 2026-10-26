#!/bin/sh
set -e

if [ ! -f .env ]; then
    key="${APP_KEY:-base64:$(php -r 'echo base64_encode(random_bytes(32));')}"
    printf 'APP_KEY=%s\n' "$key" > .env
fi

php artisan migrate --force
php artisan db:seed --force

exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload
