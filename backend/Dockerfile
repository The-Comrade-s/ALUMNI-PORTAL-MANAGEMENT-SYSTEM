# syntax=docker/dockerfile:1

###############################################################################
# Stage 1 - Laravel Skeleton
###############################################################################
FROM composer:2 AS skeleton

WORKDIR /skeleton

RUN composer create-project laravel/laravel:^12.0 . \
    --prefer-dist \
    --no-interaction \
    --no-scripts \
    --ignore-platform-reqs


###############################################################################
# Stage 2 - Build Application
###############################################################################
FROM php:8.3-cli-alpine AS vendor

RUN apk add --no-cache \
        git \
        unzip \
        libpng-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        postgresql-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install \
        gd \
        zip \
        intl \
        mbstring \
        pdo \
        pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy Laravel skeleton first
COPY --from=skeleton /skeleton .

# Overlay project files
COPY composer.json composer.json
COPY app/ app/
COPY routes/ routes/
COPY database/ database/
COPY config/cors.php config/cors.php
COPY bootstrap/app.php bootstrap/app.php
COPY resources/views/ resources/views/

RUN composer update \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction \
    && composer dump-autoload --optimize


###############################################################################
# Stage 3 - Runtime
###############################################################################
FROM php:8.3-fpm-alpine AS runtime

RUN apk add --no-cache \
        nginx \
        supervisor \
        gettext \
        libpng-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        postgresql-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install \
        gd \
        zip \
        intl \
        mbstring \
        pdo \
        pdo_pgsql \
        opcache \
    && apk add --no-cache libpng freetype libjpeg-turbo libzib icu-libs oniguruma libpq \
    && apk del \
        postgresql-dev \
        libzip-dev \
        libpng-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        icu-dev \
        oniguruma-dev

RUN { \
        echo "opcache.enable=1"; \
        echo "opcache.validate_timestamps=0"; \
        echo "opcache.max_accelerated_files=20000"; \
        echo "opcache.memory_consumption=192"; \
    } > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /app

COPY --from=vendor /app /app

RUN mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf.template /etc/nginx/http.d/app.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENV PORT=8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
CMD wget -q -O /dev/null http://127.0.0.1:${PORT}/up || exit 1

ENTRYPOINT ["/entrypoint.sh"]
