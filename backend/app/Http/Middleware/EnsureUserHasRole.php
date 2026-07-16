<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route-level guard for coarse role checks, e.g.:
 *   Route::middleware('role:administrator,super_administrator')
 * Fine-grained, resource-specific authorization still goes through Policies.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole(...$roles)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        if (! $user->isApproved()) {
            abort(403, 'Your account is pending approval.');
        }

        return $next($request);
    }
}
