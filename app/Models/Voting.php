<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voting extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $table = 'voting';

    protected $fillable = [
        'perumahan_id', 'judul', 'deskripsi', 'deadline', 'status',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    public function pilihan(): HasMany
    {
        return $this->hasMany(VotingPilihan::class);
    }

    public function suara(): HasMany
    {
        return $this->hasMany(VotingSuara::class);
    }
}
