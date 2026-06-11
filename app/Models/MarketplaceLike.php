<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceLike extends Model
{
    protected $fillable = ['marketplace_id', 'user_id'];

    public function marketplace() { return $this->belongsTo(Marketplace::class); }
    public function user() { return $this->belongsTo(User::class); }
}
