<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Check if the authenticated user has permission for a specific module + action.
     *
     * Usage: ->middleware('permission:warga,create')
     */
    public function handle(Request $request, Closure $next, string $module, string $action): Response
    {
        $user = $request->user();

        if (!$user || !$user->hasPermission($module, $action)) {
            if ($request->inertia()) {
                return response()->json(['message' => 'Anda tidak memiliki akses untuk aksi ini.'], 403);
            }

            abort(403, 'Anda tidak memiliki akses untuk aksi ini.');
        }

        return $next($request);
    }
}
