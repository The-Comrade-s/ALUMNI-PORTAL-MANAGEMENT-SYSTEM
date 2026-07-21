# Railway — Backend Deployment

The backend deploys to Railway as a Docker container built from
`backend/Dockerfile`. That Dockerfile bootstraps a full Laravel 12
skeleton at build time and overlays this repo's app code on top — you
don't need to run `composer create-project` yourself first; the container
build does it. Nothing about the Dockerfile itself is Railway-specific —
Railway builds and runs standard multi-stage Dockerfiles directly.

## 1. Prerequisites

- A [Railway](https://railway.app) account.
- A Supabase Postgres database already created — see `SUPABASE.md`.
- Your `APP_KEY` generated ahead of time:
  ```bash
  # Locally, with PHP + Composer installed, from an empty temp Laravel app
  # (or run this inside the built Docker image once, then copy the value out):
  php artisan key:generate --show
  ```
  This prints a `base64:...` string — copy it, you'll paste it into
  Railway's env vars below. Don't let the app generate this for you at
  runtime; if the container restarts without a fixed key, every existing
  session/token becomes invalid and encrypted data becomes unreadable.

## 2. Create the service

1. Railway dashboard → **New Project** → **Deploy from GitHub repo** →
   select your repo.
2. Railway will try to auto-detect a build method. Since `Dockerfile`
   lives in `backend/`, not the repo root, open the new service's
   **Settings** tab and set:
   - **Root Directory:** `backend`
   - **Builder:** Dockerfile (Railway should auto-select this once it
     finds `backend/Dockerfile` under the root directory you set)
3. **Port:** Railway automatically injects a `PORT` environment variable
   and routes traffic to whatever the container binds to — the same
   pattern this Dockerfile already relies on (`docker/entrypoint.sh`
   renders nginx's config from `$PORT` at container start). No manual
   port configuration needed in Railway's settings.
4. **Healthcheck path:** Settings → set **Healthcheck Path** to `/up`
   (Laravel's built-in health route, already wired in `bootstrap/app.php`
   and separately checked by the Dockerfile's own `HEALTHCHECK`
   instruction for container-level restarts).

## 3. Environment variables

Service → **Variables** tab (or bulk-paste via the "Raw Editor"). See
`backend/.env.example` for the full list with explanations; the ones that
matter most for a first deploy:

```env
APP_NAME="Gateway ICT Polytechnic Saapade Alumni Portal"
APP_ENV=production
APP_KEY=base64:...                      # from step 1 — never leave blank
APP_DEBUG=false
APP_URL=https://<your-railway-service>.up.railway.app

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

Railway also auto-generates its own internal reference variables (like
`RAILWAY_PUBLIC_DOMAIN`) if you want to wire `APP_URL` to it dynamically
instead of hardcoding — optional, hardcoding is simpler and fine here.

## 4. Running migrations

The Docker image doesn't run migrations automatically on every boot (a
crash-looping container shouldn't also be hammering your database with
migration attempts). Run them as a one-off:

- **Railway CLI** (recommended): install with `npm i -g @railway/cli`,
  then from the repo root:
  ```bash
  railway login
  railway link          # select this project/service
  railway run php artisan migrate --force --seed
  ```
  `railway run` executes the command locally but with the linked
  service's environment variables injected — it reaches your Supabase
  database exactly as the deployed container would. Drop `--seed` after
  the first run (the seeders use `updateOrCreate` so re-running is
  harmless, just unnecessary).
- **Or:** point your local `backend/.env` at Supabase's **direct**
  connection (port `5432`, see `SUPABASE.md`) and run
  `php artisan migrate --seed` from your machine before the app serves
  any traffic.

## 5. Verifying the deploy

```bash
curl https://<your-railway-service>.up.railway.app/up
# expect: 200 OK

curl -X POST https://<your-railway-service>.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"superadmin@gatewaypolysaapade.edu.ng","password":"<your SUPER_ADMIN_SEED_PASSWORD>"}'
# expect: 200 OK with a JSON body containing "token"
```

## 6. Logs

`docker/supervisord.conf` routes both nginx and php-fpm output to
stdout/stderr, which Railway captures directly — view them in the
service's **Deployments** tab (click a deployment → View Logs), or stream
live with `railway logs` from the CLI.

## 7. Custom domain

Service → Settings → **Networking** → add a custom domain (e.g.
`api.gatewaypolysaapade.edu.ng`) and follow Railway's DNS instructions
(usually a CNAME record). Once attached, update `APP_URL` to match, and
make sure the Vercel frontend's `NEXT_PUBLIC_API_URL` points at the new
domain too (see `VERCEL.md`).

## Known limitations to know about before relying on this

- **No queue worker service is defined.** `QUEUE_CONNECTION=sync` runs
  jobs inline in the request — fine at low traffic, but if you add
  anything slow (bulk email, report generation as a job) later, you'll
  want a second Railway service in the same project running
  `php artisan queue:work` against `QUEUE_CONNECTION=database`. Railway
  makes this easy — add a second service pointed at the same repo/
  Dockerfile with a different start command.
- **No scheduler is running.** If you ever add scheduled tasks
  (`app/Console/Kernel.php` schedule), Railway needs either a Cron Job
  service (Railway supports these natively — New → Cron Job) calling
  `php artisan schedule:run` every minute, or an external trigger.
- This guide has not been run against a live Railway deployment in this
  environment — no network access here to test it end-to-end. The
  Dockerfile and steps are written from Railway's documented Docker-deploy
  model and standard Laravel production practice; verify against
  Railway's current dashboard before assuming every setting name matches
  exactly.
