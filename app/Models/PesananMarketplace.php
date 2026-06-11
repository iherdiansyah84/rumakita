<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PesananMarketplace extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $fillable = [
        'perumahan_id',
        'marketplace_id',
        'pembeli_id',
        'penjual_id',
        'pesan',
        'status',
    ];

    public function marketplace()
    {
        return $this->belongsTo(Marketplace::class);
    }

    public function pembeli()
    {
        return $this->belongsTo(User::class, 'pembeli_id');
    }

    public function penjual()
    {
        return $this->belongsTo(User::class, 'penjual_id');
    }

    public function messages()
    {
        return $this->hasMany(PesananMessage::class);
    }
}
