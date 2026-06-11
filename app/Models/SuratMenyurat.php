<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratMenyurat extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $fillable = [
        'perumahan_id',
        'user_id',
        'jenis_surat',
        'keperluan',
        'keterangan_tambahan',
        'dokumen_pendukung',
        'status',
        'catatan_admin',
        'nomor_surat',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
