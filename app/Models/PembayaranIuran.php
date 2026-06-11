<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PembayaranIuran extends Model
{
    protected $fillable = ['perumahan_id', 'warga_id', 'tanggal', 'total', 'status', 'catatan'];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function warga()
    {
        return $this->belongsTo(Warga::class);
    }

    public function buktis()
    {
        return $this->hasMany(PembayaranIuranBukti::class);
    }

    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }
}
