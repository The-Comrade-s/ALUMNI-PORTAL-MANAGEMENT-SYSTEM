# Backend — Gateway ICT Polytechnic Saapade Alumni Portal

Laravel 12 REST API. This file is intentionally short — the full picture
(architecture, environment variables, deployment, troubleshooting) lives
in the repo root to avoid two docs drifting out of sync:

- **[../README.md](../README.md)** — project overview, local setup, testing, troubleshooting
- **[../KOYEB.md](../KOYEB.md)** — backend deployment specifically
- **[../SUPABASE.md](../SUPABASE.md)** — database setup

Quick reference:
- `Dockerfile` bootstraps a full Laravel skeleton at build time and
  overlays this folder's code on top — see the comments in `Dockerfile`
  itself for how the stages fit together.
- `docker/` holds the nginx/php-fpm/supervisord config the container uses
  to actually serve requests (not `artisan serve`).
- `.env.example` documents every environment variable inline.
- `php artisan test` runs the PHPUnit suite (SQLite in-memory, no DB setup
  needed locally).
