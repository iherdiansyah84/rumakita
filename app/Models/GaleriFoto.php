<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaleriFoto extends Model
{
    use HasFactory;

    protected $table = 'galeri_foto';

    protected $fillable = [
        'galeri_id', 'path',
    ];

    public function galeri(): BelongsTo
    {
        return $this->belongsTo(Galeri::class);
    }
}
