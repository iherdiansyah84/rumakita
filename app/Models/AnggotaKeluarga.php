<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnggotaKeluarga extends Model
{
    protected $table = 'anggota_keluarga';

    protected $fillable = [
        'warga_id', 'nama', 'status_hubungan', 'nik',
        'tanggal_lahir', 'jenis_kelamin', 'pekerjaan',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class);
    }
}
