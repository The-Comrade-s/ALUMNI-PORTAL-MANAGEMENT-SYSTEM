# Gateway ICT Polytechnic Saapade Alumni Portal — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind. **Phase 2** of the build:
design system, landing page, auth pages, and the dashboard shell. Directory,
Jobs, Events, News, Messaging, and Admin pages come next, built on this same
layout and token system.

## Setup

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your Laravel backend
npm run dev
```

Requires `shadcn/ui` primitives if you want to swap the hand-rolled
`.btn-primary` / `.card` utility classes for the generated component
library — run `npx shadcn@latest init` and point it at `tailwind.config.ts`;
the color tokens here (`navy`, `gold`, `ink`, `mist`, `line`) map directly
into shadcn's theme variables.

## Design system ("The Gateway Mark")

- **Palette:** `navy-800 #0B2D6B` (brief-specified primary), `gold-500
  #D4AF37` (brief-specified accent), plus supporting neutrals (`mist-50`
  background, `ink` text, `line-200` hairline borders) — see the comment
  block at the top of `tailwind.config.ts`.
- **Type:** Poppins for display/headings (brief-specified), Inter for body
  and dense data (tables, forms), JetBrains Mono for matric numbers, IDs,
  and stat figures.
- **Signature element:** `components/shared/GatewayMark.tsx` — three
  slow-rotating ring outlines in navy/gold, echoing the institution logo's
  three interlocking cogs. Used deliberately in exactly two places (landing
  hero, auth pages) rather than scattered throughout, standing for the
  alumni network: distinct parts that stay permanently linked.
- **Cards:** 12px radius (`rounded-card`), soft shadow, white on `mist-50`.
- **Accessibility floor:** visible gold focus ring on every interactive
  element (`globals.css`), `prefers-reduced-motion` respected for the
  GatewayMark animation, responsive down to mobile on every page built so far.

## Structure

```
app/
  page.tsx              → landing page
  login/, register/      → auth pages
  (dashboard)/
    layout.tsx           → sidebar + topbar shell
    dashboard/page.tsx    → alumni dashboard home
components/shared/        → Logo, GatewayMark, Sidebar, Topbar
lib/api-client.ts         → Sanctum SPA-auth fetch wrapper
```

## Auth flow

`lib/api-client.ts` implements the Sanctum SPA pattern: it calls
`GET {API_URL}/sanctum/csrf-cookie` before the first mutating request, then
sends the `XSRF-TOKEN` cookie back as a header on every request. No bearer
tokens are stored in `localStorage`. Login/Register forms are currently
static markup — wiring them to `apiFetch('/auth/login', ...)` etc. is the
first task of the next phase, alongside building out the Alumni Directory,
Jobs, Events, News, Messaging, and Admin Panel pages using this same shell.

## Logo usage

`public/images/logo.png` is the official, unmodified institution logo. It's
used via `components/shared/Logo.tsx` in the navbar, auth pages, sidebar,
and footer, and set as the favicon in `app/layout.tsx`. Proportions and
colors are preserved everywhere — never redraw or recolor it.
