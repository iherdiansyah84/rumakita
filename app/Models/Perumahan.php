<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Perumahan extends Model
{
    use HasFactory;

    protected $table = 'perumahan';

    protected $fillable = [
        'nama', 'lokasi', 'admin_nama', 'telepon', 'email', 'total_unit', 'status',
        'rt', 'rw', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'kode_pos', 'nama_ketua_rt'
    ];

    public function warga(): HasMany
    {
        return $this->hasMany(Warga::class);
    }
}
