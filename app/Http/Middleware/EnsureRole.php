<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !$user->role || (!in_array($user->role->name, $roles) && $user->role->name !== 'super_admin')) {
            if ($request->inertia()) {
                return response()->json(['message' => 'Akses ditolak.'], 403);
            }

            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}
