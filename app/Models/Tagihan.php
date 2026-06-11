<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    protected $fillable = ['master_iuran_id', 'warga_id', 'status', 'tanggal_bayar', 'pembayaran_iuran_id'];

    public function masterIuran()
    {
        return $this->belongsTo(MasterIuran::class);
    }

    public function warga()
    {
        return $this->belongsTo(Warga::class);
    }

    public function pembayaran()
    {
        return $this->belongsTo(PembayaranIuran::class, 'pembayaran_iuran_id');
    }
}
