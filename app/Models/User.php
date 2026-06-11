<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role_id', 'perumahan_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, \App\Traits\BelongsToPerumahan;

    /**
     * Get the role assigned to this user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the surat menyurat requested by this user.
     */
    public function suratMenyurats(): HasMany
    {
        return $this->hasMany(SuratMenyurat::class);
    }

    /**
     * Check if user has the "pengurus" role (backward compat).
     */
    public function isPengurus(): bool
    {
        return $this->role?->name === 'pengurus';
    }

    /**
     * Check if user has the "warga" role (backward compat).
     */
    public function isWarga(): bool
    {
        return $this->role?->name === 'warga';
    }

    /**
     * Check if user has the "super_admin" role.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role?->name === 'super_admin';
    }

    /**
     * Check if user has a specific permission on a module.
     */
    public function hasPermission(string $module, string $action): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if (!$this->role) {
            return false;
        }

        return $this->role->hasPermission($module, $action);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
