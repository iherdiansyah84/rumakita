<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['name', 'label', 'description'];

    /**
     * Get all permissions for this role.
     */
    public function permissions(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }

    /**
     * Get all users assigned to this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Check if this role has a specific permission.
     */
    public function hasPermission(string $module, string $action): bool
    {
        $permission = $this->permissions->firstWhere('module', $module);

        if (!$permission) {
            return false;
        }

        return in_array($action, $permission->actions ?? []);
    }

    /**
     * Get a flat map of all permissions: ['module.action' => true, ...]
     */
    public function getPermissionsMap(): array
    {
        $map = [];

        foreach ($this->permissions as $permission) {
            foreach ($permission->actions as $action) {
                $map["{$permission->module}.{$action}"] = true;
            }
        }

        return $map;
    }
}
