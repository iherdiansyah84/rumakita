<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PembayaranIuranBukti extends Model
{
    protected $fillable = ['pembayaran_iuran_id', 'file_path'];

    public function pembayaran()
    {
        return $this->belongsTo(PembayaranIuran::class, 'pembayaran_iuran_id');
    }
}
