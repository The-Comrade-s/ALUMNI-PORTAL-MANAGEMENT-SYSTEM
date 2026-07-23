#!/bin/sh
set -e

# Railway injects PORT at runtime; nginx.conf can't read env vars natively,
# so render the template with envsubst before starting.
export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/http.d/app.conf.template > /etc/nginx/http.d/default.conf

# Cache config/routes/views for production. Safe to fail on first-ever
# boot before APP_KEY exists — don't crash the container over it, the
# release/migrate step (see RAILWAY.md) sets that up first.
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Idempotent — required for uploaded profile photos/CVs/event banners
# (stored on the public disk) to be reachable at /storage/... .
php artisan storage:link || true

exec supervisord -c /etc/supervisord.conf
