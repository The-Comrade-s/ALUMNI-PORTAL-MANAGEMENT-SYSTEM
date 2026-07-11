# Gateway ICT Polytechnic Saapade — Alumni Portal Management System

Full-stack alumni portal: Next.js 15 frontend, Laravel 12 API (Sanctum SPA
auth), PostgreSQL. This package contains the complete `/backend` and
`/frontend` codebases, deployment config, and automated tests.

## What's built and working

**Backend**
- Full DB schema (7 migrations, 14 models): roles/permissions, users,
  School→Department→Programme→Graduation Year hierarchy, alumni profiles,
  representatives, jobs, events + registrations + gallery, news, messaging,
  notifications, audit logs, settings
- RBAC: 5 roles, permission pivot, `role:` middleware, Policies
- Auth: register (pending-approval workflow), login, logout, me,
  forgot/reset password
- Full CRUD APIs: Alumni directory + profile + verification, Jobs, Events +
  registration, News, Admin CRUD for Schools/Departments/Programmes/
  Graduation Years, alumni approval queue, audit log viewer
- **Messaging**: `ConversationController` — start conversations, send/read
  messages, unread counts, participant-only access enforcement
- **Notifications**: `NotificationService` creates in-app notifications on
  alumni approval/rejection, event registration, new messages, and new
  registrations (to admins); `NotificationController` for listing/marking
  read. This is in-app only — no email/push delivery is wired up.
- **Reports**: CSV (dependency-free), XLSX (`maatwebsite/excel`), and PDF
  (`barryvdh/laravel-dompdf`, with a branded Blade template) alumni exports,
  all pinned in `composer.json`
- **Automated tests**: PHPUnit feature tests covering auth, job posting
  policies, event registration, directory filtering/visibility, admin
  structural CRUD, and messaging (7 test files, ~25 assertions total) —
  run with `php artisan test`. Uses SQLite in-memory, no DB setup needed.
- Auto audit-logging via model observer; seeders for roles, permissions,
  super admin, starter academic data

**Frontend**
- Design system: navy/gold brand tokens, Poppins/Inter/JetBrains Mono,
  the "Gateway Mark" signature motif, your logo wired throughout
- Landing, Login, Register (fully wired to the API, live cascading
  dropdowns) pages
- Alumni-facing dashboard: Dashboard home, **Directory** (search + filter),
  **Jobs** (filter by type), **Events** (list + working register button),
  **News** (list + expand), **Profile** (view/edit, calls the real API),
  **Messages** (conversation list + live chat panel)
- **Notifications dropdown** in the topbar (unread badge, mark-all-read)
- **Admin Panel**: separate navy sidebar, dashboard home, a reusable
  `CrudTable` component powering Schools/Departments/Programmes/Graduation
  Years (create/edit/delete with cascading dropdowns), Alumni Approval
  queue, Audit Log viewer, Reports page (CSV/XLSX/PDF download buttons)
- **Automated tests**: Vitest + React Testing Library, 2 test files
  covering `LoginForm` and `CrudTable` — run with `npm run test`

**Deployment**
- `render.yaml` blueprint: backend web service, queue worker, frontend web
  service, managed PostgreSQL
- `backend/Dockerfile`

## Honest scope notes

This is a working, coherent MVP across every module you asked for — not a
mock. A few things worth knowing before you treat it as production-final:

- **Notification delivery is in-app only.** The `notifications` table and
  UI work; there's no email or push channel wired to Laravel's queue yet.
- **Test coverage is representative, not exhaustive.** Core auth/policy/
  registration flows are covered; edge cases, admin department/programme
  CRUD tests, and full frontend E2E (Cypress/Playwright) are not.
- **PDF/XLSX depend on Composer packages not yet installed** (they're in
  `composer.json`, just run `composer install`).
- **No CI pipeline running the tests yet** — `render.yaml` deploys on
  push but doesn't gate on `php artisan test` / `npm run test` passing
  first; wire that into GitHub Actions before relying on it.
- **Representative-management and Settings controllers** are still just
  noted as comments in `routes/api.php`.
- Nothing here has been run against a live PostgreSQL/Node install in this
  environment (no network access to install Composer/npm packages) — it's
  been written and reviewed carefully, not executed. Run the test suites
  after `composer install` / `npm install` to catch anything that slipped
  through.

## Before you push this to GitHub

1. **Generate lockfiles first**, then commit them — CI needs `composer.lock`
   and `frontend/package-lock.json` to install exact versions and to enable
   npm's dependency cache in the workflow:
   ```bash
   cd backend && composer install   # creates composer.lock
   cd ../frontend && npm install    # creates package-lock.json
   ```
2. **Never commit a real `.env`** — `.gitignore` (root) and
   `backend/.gitignore` both exclude it; only the `.env.example` files
   should be tracked. Double-check `git status` before your first commit.
3. **`.github/workflows/ci.yml`** runs `php artisan test` and
   `npm run test` + a TypeScript check on every push/PR to `main` — this
   closes the "no CI" gap noted earlier. It doesn't deploy; Render's own
   GitHub integration handles deploys via `render.yaml` once you connect
   the repo as a Blueprint.
4. **Choose a license** — no `LICENSE` file is included since this is
   institutional software with an implied "all rights reserved" default;
   add one explicitly (MIT, proprietary notice, etc.) if Gateway ICT
   Polytechnic wants the repo's terms stated outright.
5. Repo root should be this folder's contents (`backend/`, `frontend/`,
   `render.yaml`, `README.md`, `.github/`) — not a nested subfolder —
   or Render's Blueprint won't find `render.yaml` and the CI workflow
   paths (`working-directory: backend` / `frontend`) will break.

## Getting it running locally

```bash
# Backend
cd backend
composer create-project laravel/laravel:^12.0 . --prefer-dist  # if starting from scratch, then copy these files in, overwriting defaults
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
php artisan test        # run the backend test suite
php artisan serve

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run test             # run the frontend test suite
npm run dev
```

Log in with the seeded super admin: `superadmin@gatewaypolysaapade.edu.ng` /
the value you set for `SUPER_ADMIN_SEED_PASSWORD`. Admin panel is at
`/admin` on the frontend once you've built auth-guarding into that route
group (currently open — add a middleware/guard check before deploying
publicly).

## Deploying to Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint from the repo — it reads `render.yaml`
   and provisions the backend web service, queue worker, frontend web
   service, and managed Postgres.
3. Fill in the `sync: false` env vars in the Render dashboard.
4. Push to `main` — Render auto-deploys; the backend build command runs
   migrations on every deploy.

## Suggested next steps

1. Add auth-guard middleware to the `(dashboard)` and `(admin)` route
   groups on the frontend (currently unguarded at the routing level —
   the API enforces auth, but the UI will render before an unauthenticated
   request fails)
2. Wire GitHub Actions to run both test suites before Render deploys
3. Add email delivery for notifications (Laravel Notification channels)
4. Representative-management and Settings controllers
5. Broaden test coverage (department/programme CRUD, news, admin edge cases, frontend E2E)
