<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiDetail extends Model
{
    protected $fillable = [
        'transaksi_id', 'nama_iuran', 'bulan', 'tahun', 'jumlah',
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class);
    }
}
