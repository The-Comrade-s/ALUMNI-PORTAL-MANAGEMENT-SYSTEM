# Koyeb — Backend Deployment

The backend deploys to Koyeb as a Docker container built from
`backend/Dockerfile`. That Dockerfile bootstraps a full Laravel 12
skeleton at build time and overlays this repo's app code on top — you
don't need to run `composer create-project` yourself first; the container
build does it.

## 1. Prerequisites

- A [Koyeb](https://www.koyeb.com) account.
- A Supabase Postgres database already created — see `SUPABASE.md`.
- Your `APP_KEY` generated ahead of time:
  ```bash
  # Locally, with PHP + Composer installed, from an empty temp Laravel app
  # (or run this inside the built Docker image once, then copy the value out):
  php artisan key:generate --show
  ```
  This prints a `base64:...` string — copy it, you'll paste it into Koyeb's
  env vars below. Don't let Koyeb generate this for you at runtime; if the
  container restarts without a fixed key, every existing session/token
  becomes invalid and encrypted data becomes unreadable.

## 2. Create the service

1. Koyeb dashboard → **Create Service** → **Docker** → connect your GitHub
   repo, or point it at the repo URL directly.
2. **Dockerfile path:** `backend/Dockerfile`
3. **Build context:** `backend/` (not the repo root — the Dockerfile's
   `COPY` paths are relative to `backend/`)
4. **Port:** Koyeb auto-detects `$PORT` from the `EXPOSE`/`ENV PORT`
   directives in the Dockerfile; the container's `entrypoint.sh` binds
   nginx to whatever Koyeb sets `PORT` to at runtime. You don't need to
   hardcode a port in Koyeb's settings.
5. **Health check path:** `/up` (Laravel's built-in health route, already
   wired in `bootstrap/app.php` and checked by the Dockerfile's
   `HEALTHCHECK` instruction too).

## 3. Environment variables

Set these in Koyeb's service settings (Environment Variables tab). See
`backend/.env.example` for the full list with explanations; the ones that
matter most for a first deploy:

```env
APP_NAME="Gateway ICT Polytechnic Saapade Alumni Portal"
APP_ENV=production
APP_KEY=base64:...                      # from step 1 — never leave blank
APP_DEBUG=false
APP_URL=https://<your-koyeb-service>.koyeb.app

FRONTEND_URL=https://<your-vercel-app>.vercel.app
LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=<supabase-pooler-host>
DB_PORT=6543
DB_DATABASE=postgres
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<your-supabase-db-password>
DB_SSLMODE=require

SESSION_DRIVER=database
QUEUE_CONNECTION=sync

MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@gatewaypolysaapade.edu.ng

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=alumni-portal-uploads
AWS_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3
AWS_USE_PATH_STYLE_ENDPOINT=true

SUPER_ADMIN_SEED_PASSWORD=<set a real one, not the example default>
```

`FRONTEND_URL` matters more than it looks: it's the CORS allowlist
(`backend/config/cors.php`) for your Vercel frontend's exact origin. Get
this wrong and every API call from the deployed frontend fails with a
CORS error in the browser console before it even reaches Laravel.

## 4. Running migrations

The Docker image doesn't run migrations automatically on every boot (a
crash-looping container shouldn't also be hammering your database with
migration attempts). Run them as a one-off:

- **Koyeb CLI:** `koyeb service exec <service-id> -- php artisan migrate --force --seed`
  (first deploy only — drop `--seed` after the initial run, or you'll
  re-seed roles/permissions on every subsequent run; the seeders use
  `updateOrCreate` so it's idempotent but unnecessary noise).
- **Or:** point your local `backend/.env` at Supabase's **direct**
  connection (port `5432`, see `SUPABASE.md`) and run
  `php artisan migrate --seed` from your machine before the app serves
  any traffic.

## 5. Verifying the deploy

```bash
curl https://<your-koyeb-service>.koyeb.app/up
# expect: 200 OK

curl -X POST https://<your-koyeb-service>.koyeb.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"superadmin@gatewaypolysaapade.edu.ng","password":"<your SUPER_ADMIN_SEED_PASSWORD>"}'
# expect: 200 OK with a JSON body containing "token"
```

## 6. Logs

`docker/supervisord.conf` routes both nginx and php-fpm output to
stdout/stderr, which Koyeb captures directly in its Logs tab — no log
file to dig into inside the container.

## Known limitations to know about before relying on this

- **No queue worker service is defined.** `QUEUE_CONNECTION=sync` runs
  jobs inline in the request — fine at low traffic, but if you add
  anything slow (bulk email, report generation as a job) later, you'll
  want a second Koyeb service running `php artisan queue:work` against
  `QUEUE_CONNECTION=database`.
- **No scheduler is running.** If you ever add scheduled tasks
  (`app/Console/Kernel.php` schedule), Koyeb needs either a cron-trigger
  service calling `php artisan schedule:run` every minute, or Koyeb's own
  cron job feature pointed at the same container image.
- This guide has not been run against a live Koyeb deployment in this
  environment — no network access here to test it end-to-end. The
  Dockerfile and steps are written from Koyeb's documented Docker-deploy
  model and standard Laravel production practice; verify against Koyeb's
  current dashboard before assuming every setting name matches exactly.
