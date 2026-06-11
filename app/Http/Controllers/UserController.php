<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('role')->latest()->get()->map(fn(User $u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role?->name ?? 'warga',
                'role_label' => $u->role?->label ?? 'Warga',
                'role_id'    => $u->role_id,
                'created_at' => $u->created_at->format('d M Y'),
            ]),
            'roles' => Role::orderBy('label')->get(['id', 'name', 'label']),
            'stats' => [
                'total'    => User::count(),
                'pengurus' => User::whereHas('role', fn($q) => $q->where('name', 'pengurus'))->count(),
                'warga'    => User::whereHas('role', fn($q) => $q->where('name', 'warga'))->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role'     => 'required|exists:roles,name',
        ]);

        $role = Role::where('name', $validated['role'])->first();

        User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id'  => $role->id,
        ]);

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role'     => 'required|exists:roles,name',
            'password' => ['nullable', Password::min(8)],
        ]);

        $role = Role::where('name', $validated['role'])->first();

        $user->name    = $validated['name'];
        $user->email   = $validated['email'];
        $user->role_id = $role->id;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['delete' => 'Tidak dapat menghapus akun Anda sendiri.']);
        }

        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
