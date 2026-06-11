<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warga extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $table = 'warga';

    protected $fillable = [
        'perumahan_id', 'nama', 'nik', 'blok', 'no_hp', 'email', 'status_iuran',
        'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 'pekerjaan',
        'status_perkawinan', 'alamat_asal', 'tipe_dokumen', 'no_dokumen',
        'foto_ktp', 'foto_kk', 'status_tinggal', 'alamat_pindah',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];



    public function anggotaKeluarga(): HasMany
    {
        return $this->hasMany(AnggotaKeluarga::class);
    }

    public function tagihans(): HasMany
    {
        return $this->hasMany(Tagihan::class);
    }

    public function pembayaranIurans(): HasMany
    {
        return $this->hasMany(PembayaranIuran::class);
    }
}
