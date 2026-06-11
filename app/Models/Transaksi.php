<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $table = 'transaksi';

    protected $fillable = [
        'perumahan_id', 'warga_id', 'tanggal', 'deskripsi', 'tipe', 'jumlah', 'kategori',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah'  => 'integer',
    ];

    public function warga()
    {
        return $this->belongsTo(Warga::class);
    }

    public function details()
    {
        return $this->hasMany(TransaksiDetail::class);
    }
}
