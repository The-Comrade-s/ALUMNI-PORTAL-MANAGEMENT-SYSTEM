# Gateway ICT Polytechnic Saapade Alumni Portal — Backend

Laravel 12 REST API (Sanctum SPA auth) backing the Next.js frontend. This is
**Phase 1** of the build: auth, RBAC scaffolding, and the full database
schema. Resource controllers for Jobs/Events/News/Messaging/Admin are stubbed
in `routes/api.php` and will be added module by module.

## Requirements
- PHP 8.3+
- Composer
- PostgreSQL 16+

## Setup

```bash
composer create-project laravel/laravel:^12.0 . --prefer-dist   # if starting fresh
# then drop these app/, database/, routes/ files into the generated project,
# overwriting the defaults.

composer require laravel/sanctum

cp .env.example .env
php artisan key:generate

# create the database, then:
php artisan migrate
php artisan db:seed
```

This seeds:
- 5 roles (guest, alumni, class_representative, administrator, super_administrator)
- baseline permissions wired to admin/super-admin roles
- one super admin account: `superadmin@gatewaypolysaapade.edu.ng` / value of `SUPER_ADMIN_SEED_PASSWORD`
- a starter academic structure (1 school, 1 department, ND/HND programmes, graduation years 2018–2026) — all editable/deletable from the Admin Panel, nothing is hardcoded into app logic

## Sanctum SPA auth

The frontend and backend must share a registrable domain in dev
(`localhost`), matching `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` in
`.env`. The frontend calls `GET /sanctum/csrf-cookie` before the first
POST, then all requests are cookie-authenticated — no bearer tokens stored
client-side.

## What's included in this phase
- Full schema: `database/migrations/*` (roles/permissions, users, academic
  hierarchy, alumni profiles, jobs, events, news, messaging, notifications,
  audit logs, settings)
- Models with relationships: `app/Models/*`
- RBAC: `Role`/`Permission` models + `User::hasRole()`/`hasPermission()`,
  `EnsureUserHasRole` middleware, and example Policies (`JobPostingPolicy`,
  `EventPolicy`, `AlumniProfilePolicy`, `NewsPolicy`)
- Auth: `AuthController` (register with pending-approval flow, login, logout,
  me, forgot/reset password) using Form Requests for validation
- Audit logging: `AuditObserver` auto-attached to structural/admin models
- Seeders for roles, permissions, super admin, and starter academic data

## Next phase
Alumni Directory + Profile controller, Admin CRUD controllers for
Schools/Departments/Programmes/Graduation Years, Jobs/Events/News
controllers, messaging, and report generation (PDF/CSV/XLSX).
