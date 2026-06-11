<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PesananMessage extends Model
{
    protected $fillable = ['pesanan_marketplace_id', 'user_id', 'pesan'];

    public function pesanan() { return $this->belongsTo(PesananMarketplace::class, 'pesanan_marketplace_id'); }
    public function user() { return $this->belongsTo(User::class); }
}
