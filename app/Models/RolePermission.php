<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    protected $fillable = ['role_id', 'module', 'actions'];

    protected function casts(): array
    {
        return [
            'actions' => 'array',
        ];
    }

    /**
     * Get the role that owns this permission.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
