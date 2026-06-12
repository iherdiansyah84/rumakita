<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Get available modules from config.
     */
    private function getModules(): array
    {
        return config('permissions.modules', []);
    }

    /**
     * Display all roles with their permissions.
     */
    public function index(): Response
    {
        $roles = Role::withCount('users')
            ->with('permissions')
            ->when(auth()->user()->role->name !== 'super_admin', function ($query) {
                $query->where('name', '!=', 'super_admin');
            })
            ->latest()
            ->get()
            ->map(fn(Role $role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'label'       => $role->label,
                'description' => $role->description,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->mapWithKeys(fn(RolePermission $p) => [
                    $p->module => $p->actions,
                ])->toArray(),
                'created_at'  => $role->created_at->format('d M Y'),
            ]);

        return Inertia::render('Pengaturan/Roles/Index', [
            'roles'   => $roles,
            'modules' => $this->getModules(),
            'stats'   => [
                'total_roles' => Role::count(),
                'total_users' => \App\Models\User::count(),
            ],
        ]);
    }

    /**
     * Create a new role with permissions.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:50|unique:roles,name|regex:/^[a-z_]+$/',
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'array',
        ]);

        $role = Role::create([
            'name'        => $validated['name'],
            'label'       => $validated['label'],
            'description' => $validated['description'] ?? null,
        ]);

        $this->syncPermissions($role, $validated['permissions']);

        return back()->with('success', "Role \"{$role->label}\" berhasil dibuat.");
    }

    /**
     * Update an existing role and its permissions.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'array',
        ]);

        $role->update([
            'label'       => $validated['label'],
            'description' => $validated['description'] ?? null,
        ]);

        $this->syncPermissions($role, $validated['permissions']);

        return back()->with('success', "Role \"{$role->label}\" berhasil diperbarui.");
    }

    /**
     * Delete a role (only if no users are assigned).
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deleting roles that are still in use
        if ($role->users()->count() > 0) {
            return back()->withErrors([
                'delete' => "Tidak dapat menghapus role \"{$role->label}\" karena masih digunakan oleh {$role->users()->count()} pengguna.",
            ]);
        }

        // Prevent deleting built-in roles
        if (in_array($role->name, ['pengurus', 'warga'])) {
            return back()->withErrors([
                'delete' => "Role \"{$role->label}\" adalah role bawaan dan tidak dapat dihapus.",
            ]);
        }

        $role->permissions()->delete();
        $role->delete();

        return back()->with('success', "Role \"{$role->label}\" berhasil dihapus.");
    }

    /**
     * Sync permissions for a role.
     */
    private function syncPermissions(Role $role, array $permissions): void
    {
        $allModules = $this->getModules();

        // Delete existing permissions
        $role->permissions()->delete();

        // Insert new permissions
        foreach ($permissions as $module => $actions) {
            // Only save if the module is valid and has actions
            if (isset($allModules[$module]) && !empty($actions)) {
                // Filter only valid actions for this module
                $validActions = array_intersect($actions, $allModules[$module]);

                if (!empty($validActions)) {
                    $role->permissions()->create([
                        'module'  => $module,
                        'actions' => array_values($validActions),
                    ]);
                }
            }
        }

        // Clear the relation cache
        $role->unsetRelation('permissions');
    }
}
