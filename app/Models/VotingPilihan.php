<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VotingPilihan extends Model
{
    use HasFactory;

    protected $table = 'voting_pilihan';

    protected $fillable = [
        'voting_id', 'nama', 'votes',
    ];

    protected $casts = [
        'votes' => 'integer',
    ];

    public function voting(): BelongsTo
    {
        return $this->belongsTo(Voting::class);
    }
}
