<?php

use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS: Laravel applies Illuminate\Http\Middleware\HandleCors
        // globally by default and reads config/cors.php automatically —
        // no explicit registration needed here. See config/cors.php for
        // the Vercel-origin allowlist.

        // Sanctum's stateful-cookie middleware only activates for requests
        // from domains listed in SANCTUM_STATEFUL_DOMAINS (same-origin/
        // local dev); it's a harmless no-op for the bearer-token requests
        // the deployed frontend actually sends. Safe to leave enabled.
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
