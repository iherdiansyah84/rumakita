<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function __construct()
    {
        // Only pengurus can manage users
        $this->middleware(function (Request $request, $next) {
            abort_if(! $request->user()->isPengurus(), 403, 'Akses ditolak.');
            return $next($request);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::with('role');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $users = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role_id'  => 'nullable|exists:roles,id',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id'  => $validated['role_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'user'    => $user->load('role'),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['user' => $user->load('role')]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => ['nullable', Password::min(8)],
            'role_id'  => 'nullable|exists:roles,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'user'    => $user->load('role'),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'Tidak dapat menghapus akun sendiri.');

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
