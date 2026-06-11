<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Marketplace extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $table = 'marketplace';

    protected $fillable = [
        'perumahan_id', 'user_id', 'judul', 'deskripsi', 'harga', 'kategori', 'tipe_iklan', 'gambar', 'status',
    ];

    protected $casts = [
        'harga' => 'integer',
        'gambar' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pesanans()
    {
        return $this->hasMany(PesananMarketplace::class);
    }

    public function likes()
    {
        return $this->hasMany(MarketplaceLike::class);
    }
}
