# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — Laravel skeleton
# ---------------------------------------------------------------------------
# This repo ships only the custom application code (app/, routes/, database/
# migrations & seeders, config/cors.php, a custom bootstrap/app.php, and
# resources/views/reports) — not a full Laravel install. This stage creates
# a real Laravel 12 skeleton (artisan, public/index.php, the rest of
# config/*, bootstrap/providers.php, etc.) so the overlay in Stage 2 has a
# complete app to sit on top of, and the whole thing builds standalone from
# this Dockerfile with no manual "composer create-project" step required.
FROM composer:2 AS skeleton
WORKDIR /skeleton
RUN composer create-project laravel/laravel:^12.0 . \
    --prefer-dist --no-interaction --no-scripts --ignore-platform-reqs

# ---------------------------------------------------------------------------
# Stage 2 — overlay app code + install production dependencies
# ---------------------------------------------------------------------------
FROM composer:2 AS vendor
WORKDIR /app
COPY --from=skeleton /skeleton .

# Overlay this repo's custom code on top of the skeleton, overwriting the
# skeleton's defaults where we ship our own (composer.json, config/cors.php,
# bootstrap/app.php, app/, routes/, database/, resources/views).
COPY composer.json composer.json
COPY app/ app/
COPY routes/ routes/
COPY database/ database/
COPY config/cors.php config/cors.php
COPY bootstrap/app.php bootstrap/app.php
COPY resources/views/ resources/views/

RUN composer update --no-dev --optimize-autoloader --no-interaction --prefer-dist \
    && composer dump-autoload --optimize

# ---------------------------------------------------------------------------
# Stage 3 — runtime (nginx + php-fpm + supervisord)
# ---------------------------------------------------------------------------
FROM php:8.3-fpm-alpine AS runtime

RUN apk add --no-cache \
        nginx supervisor gettext \
        postgresql-dev libzip-dev libpng-dev icu-dev oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql zip gd intl mbstring opcache \
    && apk del --no-cache postgresql-dev libzip-dev libpng-dev icu-dev oniguruma-dev

RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'opcache.max_accelerated_files=20000'; \
        echo 'opcache.memory_consumption=192'; \
    } > /usr/local/etc/php/conf.d/opcache-prod.ini

WORKDIR /app
COPY --from=vendor /app /app

RUN mkdir -p storage/framework/{cache,sessions,testing,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf.template /etc/nginx/conf.d/app.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Railway sets $PORT at runtime and routes traffic to it; 8080 is just the
# documented default/fallback the entrypoint uses if $PORT is unset.
EXPOSE 8080
ENV PORT=8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/up" || exit 1

ENTRYPOINT ["/entrypoint.sh"]
