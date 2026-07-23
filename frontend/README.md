# Frontend — Gateway ICT Polytechnic Saapade Alumni Portal

Next.js 15 (App Router) + TypeScript + Tailwind. Full picture (setup,
environment variables, deployment, troubleshooting) lives in the repo
root to avoid two docs drifting out of sync:

- **[../README.md](../README.md)** — project overview, local setup, testing, troubleshooting
- **[../VERCEL.md](../VERCEL.md)** — frontend deployment specifically, incl. the auth architecture note

## Design system ("The Gateway Mark")

- **Palette:** `navy-800 #0B2D6B` (brief-specified primary), `gold-500
  #D4AF37` (brief-specified accent), plus supporting neutrals — see the
  comment block at the top of `tailwind.config.ts`.
- **Type:** Poppins for display/headings, Inter for body and dense data,
  JetBrains Mono for matric numbers, IDs, and stat figures.
- **Signature element:** `components/shared/GatewayMark.tsx` — three
  slow-rotating ring outlines in navy/gold, echoing the institution logo's
  three interlocking cogs. Used deliberately in exactly two places
  (landing hero, auth pages).
- **Cards:** 12px radius (`rounded-card`), soft shadow, white on `mist-50`.
- **Accessibility floor:** visible gold focus ring on every interactive
  element, `prefers-reduced-motion` respected, responsive down to mobile.

## Structure

```
app/
  page.tsx                → landing page
  login/, register/        → auth pages
  (dashboard)/              → alumni-facing app (Directory, Jobs, Events,
                               News, Profile, Messages) — AuthGuard-wrapped
  (admin)/                  → admin panel — AuthGuard-wrapped + role-checked
components/
  shared/                   → Logo, GatewayMark, Sidebar/AdminSidebar,
                               Topbar, NotificationsMenu, AuthGuard, LogoutButton
  forms/                    → LoginForm, RegisterForm (both call the real API)
  admin/CrudTable.tsx        → reusable table+form powering the four
                               structural-entity admin pages
lib/api-client.ts           → bearer-token fetch wrapper + blob-download helper
```

## Auth flow

`lib/api-client.ts` stores the bearer token AuthController returns on
login in `localStorage` and sends it as `Authorization: Bearer <token>` on
every request — see the comment block at the top of that file for why
(Vercel/Railway are unrelated domains, so cookie-based auth isn't reliable)
and the security trade-off that comes with it. `AuthGuard` gates the
`(dashboard)` and `(admin)` route groups client-side, since Next.js
middleware can't read `localStorage`.

## Logo usage

`public/images/logo.png` is the official, unmodified institution logo,
used via `components/shared/Logo.tsx` in the navbar, auth pages, sidebar,
footer, and favicon. Proportions and colors are preserved everywhere.
