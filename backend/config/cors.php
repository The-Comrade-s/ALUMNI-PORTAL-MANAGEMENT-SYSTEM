<?php

/**
 * CORS is now load-bearing: frontend (Vercel) and backend (Railway) are on
 * entirely unrelated domains, unlike the old same-origin/Render setup.
 * FRONTEND_URL must be the exact deployed Vercel origin (scheme + host,
 * no trailing slash) — wildcard origins are rejected by browsers whenever
 * supports_credentials is true, which it must be for Sanctum.
 */
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL'),
        env('APP_ENV') === 'local' ? 'http://localhost:3000' : null,
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
