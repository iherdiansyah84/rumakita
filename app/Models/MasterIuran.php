<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterIuran extends Model
{
    protected $fillable = ['perumahan_id', 'bulan', 'tahun', 'total_iuran'];

    public function details()
    {
        return $this->hasMany(MasterIuranDetail::class);
    }

    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }
}
