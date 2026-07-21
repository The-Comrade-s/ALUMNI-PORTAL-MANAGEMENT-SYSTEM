/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NEXT_PUBLIC_* vars are inlined by Next.js automatically from Vercel's
  // Project Settings -> Environment Variables — no manual `env` mapping
  // needed here. (A manual fallback here would silently bake in
  // 'localhost:8000' if someone forgets to set the var in Vercel, which is
  // worse than a visible build-time failure.) lib/api-client.ts still has
  // its own localhost fallback for local dev only.
  images: {
    // Institution logo is served from /public; no external image domains
    // are in use yet. Add remotePatterns here if that changes.
    remotePatterns: [],
  },
};

module.exports = nextConfig;
