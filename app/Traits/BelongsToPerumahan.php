<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

trait BelongsToPerumahan
{
    /**
     * Boot the trait.
     */
    protected static function bootBelongsToPerumahan()
    {
        static::addGlobalScope('perumahan', function (Builder $builder) {
            if (auth()->hasUser()) {
                $user = auth()->user();
                // If user is super_admin, do not filter.
                // Otherwise, filter by the user's perumahan_id
                if ($user && $user->role && $user->role->name !== 'super_admin' && $user->perumahan_id) {
                    $builder->where($builder->getModel()->getTable() . '.perumahan_id', $user->perumahan_id);
                }
            }
        });

        static::creating(function ($model) {
            if (auth()->hasUser()) {
                $user = auth()->user();
                if ($user && empty($model->perumahan_id) && $user->perumahan_id) {
                    $model->perumahan_id = $user->perumahan_id;
                }
            }
        });
    }

    /**
     * Relationship to Perumahan
     */
    public function perumahan()
    {
        return $this->belongsTo(\App\Models\Perumahan::class);
    }
}
