FROM composer:2 AS dependencies

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts --no-autoloader

COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

FROM php:8.2-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    libonig-dev \
    libxml2-dev \
    nginx \
    unzip \
    && docker-php-ext-install pdo_pgsql mbstring xml opcache \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/conf.d/default.conf

WORKDIR /var/www

COPY --from=dependencies /app/vendor ./vendor
COPY . .
COPY docker-nginx.conf /etc/nginx/conf.d/laravel.conf
COPY docker-opcache.ini /usr/local/etc/php/conf.d/opcache.ini

RUN chown -R www-data:www-data bootstrap/cache storage

EXPOSE 8000

CMD ["sh", "docker-entrypoint.sh"]
