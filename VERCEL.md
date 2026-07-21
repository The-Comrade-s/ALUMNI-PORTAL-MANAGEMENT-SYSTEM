# Vercel — Frontend Deployment

The frontend is a standard Next.js 15 App Router project — Vercel
auto-detects it, no Docker or custom build config needed beyond the one
environment variable below.

## 1. Import the project

1. [vercel.com](https://vercel.com) → **Add New → Project** → import your
   GitHub repo.
2. **Root Directory:** set this to `frontend` — the repo root has
   `backend/` alongside it, and Vercel needs to know which folder is the
   Next.js app. (Project Settings → General → Root Directory.)
3. Framework preset: Vercel should auto-detect **Next.js**. Build command
   and output directory can stay on their defaults (`next build`, `.next`).

## 2. Environment variables

Project Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://<your-railway-service>.up.railway.app
```

Set this for all three environments (Production, Preview, Development) if
you want preview deployments to work against the same backend — or point
Preview at a staging Railway service if you have one.

`NEXT_PUBLIC_*` variables are inlined into the client bundle at build
time, not read at runtime — if you change this value, you need to trigger
a new deployment (Vercel does this automatically on the next git push, or
manually via **Redeploy**) for it to take effect. This repo's
`next.config.js` deliberately does not set a build-time fallback for this
var, so a missing value will surface as broken API calls in the browser
rather than silently falling back to `localhost:8000` in production.

## 3. Deploy

Push to your connected branch (or click **Deploy** on first import).
Vercel builds with `npm install && next build` automatically.

## 4. Verifying the deploy

Once deployed:

1. Visit the Vercel URL — the landing page should render with your logo
   and branding.
2. Go to `/register` — the School/Department/Programme dropdowns should
   populate (this confirms `NEXT_PUBLIC_API_URL` is correct and CORS is
   configured right on the backend; if they stay empty, open the browser
   console — a CORS error there means `FRONTEND_URL` on the Railway backend
   doesn't match this Vercel URL exactly).
3. Log in with the seeded super admin — a successful login stores a
   bearer token in `localStorage` and redirects to `/dashboard`.

## 5. Custom domain

Project Settings → Domains → add e.g. `alumni.gatewaypolysaapade.edu.ng`.
Once attached, update the Railway backend's `FRONTEND_URL` env var to match
the new domain (not the `.vercel.app` one) and redeploy the backend, or
CORS will start rejecting requests from the custom domain.

## Auth architecture note

This frontend uses **bearer-token** auth (`lib/api-client.ts`), not
cookie-based sessions — Vercel and Railway are unrelated domains, and
cookie-based Sanctum SPA auth doesn't survive that reliably (SameSite
rules, third-party-cookie blocking in modern browsers). The token is
stored in `localStorage` after login and sent as `Authorization: Bearer
<token>` on every API call. This is standard for a genuinely decoupled
frontend/backend split, but means an XSS vulnerability in the frontend
would expose the token — see the comment block at the top of
`lib/api-client.ts` for the full trade-off explanation and the more
cookie-friendly alternative if you later host both under one apex domain.

## Known limitations to know about before relying on this

- **Route guarding is client-side only** (`components/shared/AuthGuard.tsx`).
  Next.js middleware runs at the edge and can't read `localStorage`, so
  the `(dashboard)` and `(admin)` route groups check auth after the page
  starts rendering, not before — there's a brief loading-spinner flash on
  every protected page load rather than an instant server-side redirect.
- This guide has not been run against a live Vercel deployment in this
  environment — no network access here to verify it end-to-end. Written
  from Vercel's documented Next.js zero-config deploy model; if Vercel's
  dashboard has changed field names/locations since, adjust accordingly.
