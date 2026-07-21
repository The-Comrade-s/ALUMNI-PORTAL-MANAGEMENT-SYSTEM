# Gateway ICT Polytechnic Saapade — Alumni Portal Management System

Full-stack alumni portal: Next.js 15 frontend, Laravel 12 API (Sanctum
bearer-token auth), Supabase PostgreSQL. Deploys as three independent
services: **Vercel** (frontend), **Railway** (backend, Docker), **Supabase**
(database + file storage).

## Project overview

Alumni self-register (pending admin/class-rep approval), then get access
to a directory of classmates, jobs, events, news, and messaging. Admins
manage the academic hierarchy (Schools → Departments → Programmes →
Graduation Years — all admin-editable, nothing hardcoded), approve new
alumni, and pull directory reports.

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│  Vercel          │  API   │  Railway          │  SQL   │  Supabase        │
│  Next.js 15      │◄──────►│  Laravel 12       │◄──────►│  PostgreSQL      │
│  (frontend)      │ bearer │  nginx+php-fpm     │  pgsql │  + Storage (S3)  │
│                  │ token  │  (Docker)          │  ssl   │                  │
└─────────────────┘        └──────────────────┘        └─────────────────┘
```

Frontend and backend are on **unrelated domains** (`*.vercel.app` /
`*.up.railway.app`), which is why auth is bearer-token-based rather than
cookie-based — see "Auth architecture" below.

## Installation (local development)

**Backend:**
```bash
cd backend
# Fill in the rest of a real Laravel 12 install (artisan, public/, etc.)
# without touching any file this repo already ships — same approach
# backend/Dockerfile and .github/workflows/ci.yml use.
composer create-project laravel/laravel:^12.0 /tmp/skeleton --prefer-dist --no-interaction --no-scripts
rsync -a --ignore-existing /tmp/skeleton/ .

composer install
cp .env.example .env
php artisan key:generate
# point .env at a local Postgres or a Supabase dev project — see SUPABASE.md
php artisan migrate --seed
php artisan test
php artisan serve
```

Or skip the manual skeleton step entirely and just build the Docker image
locally — `backend/Dockerfile` does this bootstrapping for you:
```bash
cd backend
docker build -t gateway-alumni-backend .
docker run -p 8080:8080 --env-file .env gateway-alumni-backend
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run test
npm run dev
```

Log in with the seeded super admin:
`superadmin@gatewaypolysaapade.edu.ng` / your `SUPER_ADMIN_SEED_PASSWORD`.

## Development

- Backend tests: `php artisan test` (PHPUnit, SQLite in-memory, no DB
  setup needed) — 7 feature test files covering auth, job posting
  policies, event registration, directory visibility/filtering, admin
  structural CRUD, and messaging.
- Frontend tests: `npm run test` (Vitest + React Testing Library).
- `.github/workflows/ci.yml` runs both suites plus a TypeScript check on
  every push/PR to `main`.

## Deployment

Three separate guides, one per service:

- **[VERCEL.md](./VERCEL.md)** — frontend deployment (near-zero-config)
- **[RAILWAY.md](./RAILWAY.md)** — backend deployment (Docker, env vars,
  running migrations, known limitations around queues/scheduling)
- **[SUPABASE.md](./SUPABASE.md)** — database setup, connection pooling,
  file storage, RLS notes

Read them in that order: Supabase first (you need connection details
before configuring Railway), then Railway (you need the backend URL before
configuring Vercel), then Vercel.

## Environment variables

Full, documented lists live in `backend/.env.example` and
`frontend/.env.example` — every variable has an inline comment explaining
what it's for and, where relevant, whether it's a local-dev-only or
production-required value. The short version:

| Variable | Where | Purpose |
|---|---|---|
| `APP_KEY` | backend | Laravel encryption key — generate once, never rotate carelessly |
| `FRONTEND_URL` | backend | CORS allowlist — must exactly match the deployed Vercel origin |
| `DB_*` | backend | Supabase Postgres connection (pooler for app traffic, direct for migrations) |
| `AWS_*` | backend | Supabase Storage (S3-compatible) for uploads |
| `SUPER_ADMIN_SEED_PASSWORD` | backend | Seeded super admin's initial password |
| `NEXT_PUBLIC_API_URL` | frontend | The Railway backend's public URL |

## Auth architecture

Bearer tokens (Sanctum personal access tokens), not cookies — see the
comment block at the top of `frontend/lib/api-client.ts` for the full
reasoning and trade-off (localStorage token storage vs. httpOnly cookies).
`AuthController::logout` still supports session-based logout as a
fallback if you ever run frontend and backend same-origin locally.

## Troubleshooting

**CORS errors in the browser console on login/register:**
`FRONTEND_URL` on the Railway backend doesn't exactly match the Vercel
origin making the request (check scheme, exact subdomain, no trailing
slash). Update it and redeploy the backend — `config/cors.php` reads it
at request time via env, but Laravel's `config:cache` (run automatically
by the Docker entrypoint) means a changed env var needs a restart to take
effect, not just a dashboard save.

**Registration/directory dropdowns stay empty:**
Either the CORS issue above, or the backend database hasn't been migrated
— `/api/v1/lookups/schools` will 500 against an empty/unmigrated database.

**Login succeeds but subsequent API calls 401:**
The bearer token isn't being attached — check that `NEXT_PUBLIC_API_URL`
was set at Vercel *build* time (it's inlined, not read at runtime; a
changed value needs a redeploy) and that nothing is clearing
`localStorage` between the login redirect and the next request.

**`php artisan migrate` fails against Supabase:**
Almost always `DB_SSLMODE` missing/wrong, or using the pooler connection
(port `6543`) for migrations instead of the direct one (port `5432`) —
see `SUPABASE.md`.

**Report downloads (CSV/XLSX/PDF) fail or download a 0-byte file:**
Confirm `composer install` actually pulled in `barryvdh/laravel-dompdf`
and `maatwebsite/excel` (both are in `backend/composer.json` but this has
not been executed in the environment that produced this codebase — see
"Honest scope notes" below).

## Maintenance

- **Rotating `APP_KEY`:** invalidates all existing sessions/tokens and
  makes any encrypted database columns unreadable. Don't do this casually
  in production; if you must, plan for every user to be logged out.
- **Database backups:** Supabase takes automatic backups on paid tiers —
  confirm your plan includes this; the free tier's backup retention is
  short.
- **Rotating the Supabase DB password:** update `DB_PASSWORD` in Railway's
  env vars and redeploy — the app will fail all DB queries between the
  password change and the redeploy completing.
- **Dependency updates:** `composer.json` and `frontend/package.json` pin
  minor-version ranges (`^`); run `composer update` / `npm update`
  periodically and re-run both test suites before deploying.

## What's built and working

**Backend:** full DB schema (7 migrations, 14 models), RBAC (5 roles,
permission pivot, Policies, `role:` middleware), auth (register with
approval workflow, login/logout, forgot/reset password — now bearer-token
based), full CRUD APIs (Alumni directory + profile + verification, Jobs,
Events + registration, News, Admin CRUD for the academic hierarchy, alumni
approval queue, audit log viewer), messaging (conversations + messages,
participant-only access), in-app notifications (approvals, event
registration, new messages, new signups), CSV/XLSX/PDF alumni reports,
audit logging via model observer, PHPUnit test suite.

**Frontend:** full design system (navy/gold brand tokens, Poppins/Inter/
JetBrains Mono, the "Gateway Mark" signature motif, your logo throughout),
landing/login/register pages (register genuinely calls the API with live
cascading dropdowns), alumni dashboard (Directory, Jobs, Events, News,
Profile, Messages — all wired to real APIs), notifications dropdown,
admin panel (structural CRUD via a reusable table component, alumni
approval queue, audit log viewer, report downloads), client-side auth
guarding with role checks, Vitest test suite.

**Deployment:** Docker multi-stage build for Railway (bootstraps a full
Laravel skeleton at build time, serves via nginx+php-fpm+supervisord, not
`artisan serve`), CORS configured for the cross-domain split, Vercel
config with security headers, GitHub Actions CI running both test suites.

## Honest scope notes

Being direct about this rather than overselling it:

- **Nothing in this repository has been executed in the environment that
  produced it.** No network access here to run `composer install`,
  `npm install`, `php artisan test`, `npm run test`, a Docker build, or an
  actual deploy to Railway/Vercel/Supabase. Everything has been written and
  cross-checked carefully — imports traced, request/response shapes
  matched between frontend and backend, a real bug caught this way (the
  register form was missing a required `school_id` field, now fixed) —
  but "carefully reviewed" is not the same claim as "tested." Run both
  test suites immediately after your first `composer install`/`npm
  install` to catch anything that slipped through static review.
- **Notification delivery is in-app only** — no email/push channel wired
  to a queue.
- **No queue worker or scheduler service** is defined for Railway —
  `QUEUE_CONNECTION=sync` runs everything inline. Fine at low traffic;
  see `RAILWAY.md`'s "Known limitations" if you need to change this.
- **Route guarding is client-side only** (Next.js middleware can't read
  the `localStorage` bearer token) — see `VERCEL.md`'s auth note.
- **Test coverage is representative, not exhaustive** — core flows are
  covered; edge cases and full E2E (Cypress/Playwright) are not.
- **Representative-management and Settings controllers** are still just
  comments in `backend/routes/api.php`.
- **File uploads** (profile photos, event galleries) have storage config
  ready (Supabase S3-compatible disk) but no upload endpoint/UI wired yet.
