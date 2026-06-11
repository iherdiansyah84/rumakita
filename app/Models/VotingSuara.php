<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VotingSuara extends Model
{
    use HasFactory;

    protected $table = 'voting_suara';

    protected $fillable = [
        'voting_id', 'voting_pilihan_id', 'user_id',
    ];

    public function voting(): BelongsTo
    {
        return $this->belongsTo(Voting::class);
    }

    public function pilihan(): BelongsTo
    {
        return $this->belongsTo(VotingPilihan::class, 'voting_pilihan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
