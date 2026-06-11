<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Galeri extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $table = 'galeri';

    protected $fillable = [
        'perumahan_id', 'user_id', 'judul', 'tanggal_kegiatan', 'kategori',
    ];

    protected $casts = [
        'tanggal_kegiatan' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function foto(): HasMany
    {
        return $this->hasMany(GaleriFoto::class);
    }
}
