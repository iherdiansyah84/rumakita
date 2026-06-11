<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Diskusi extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $table = 'diskusi';

    protected $fillable = [
        'perumahan_id', 'user_id', 'judul', 'konten', 'kategori', 'status', 'lampiran',
    ];

    protected $casts = [
        'likes' => 'integer',
        'lampiran' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function komentar(): HasMany
    {
        return $this->hasMany(KomentarDiskusi::class);
    }

    public function reactions()
    {
        return $this->morphMany(Reaction::class, 'reactionable');
    }
}
