#!/bin/sh
set -e

if [ -z "${APP_KEY:-}" ] && [ ! -f .env ]; then
    key="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    export APP_KEY="$key"
fi

php artisan migrate --force

if [ "${RUN_SEED:-false}" = "true" ]; then
    php artisan db:seed --force
fi

php-fpm -D
exec nginx -g 'daemon off;'
