<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KomentarDiskusi extends Model
{
    use HasFactory;

    protected $table = 'komentar_diskusi';

    protected $fillable = [
        'diskusi_id', 'user_id', 'konten', 'parent_id',
    ];

    public function diskusi(): BelongsTo
    {
        return $this->belongsTo(Diskusi::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reactions()
    {
        return $this->morphMany(Reaction::class, 'reactionable');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(KomentarDiskusi::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(KomentarDiskusi::class, 'parent_id');
    }
}
