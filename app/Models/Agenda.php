<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    use HasFactory, \App\Traits\BelongsToPerumahan;

    protected $table = 'agenda';

    protected $fillable = [
        'perumahan_id', 'judul', 'tanggal', 'waktu_mulai', 'waktu_selesai',
        'lokasi', 'tipe', 'penyelenggara', 'max_peserta', 'status',
    ];

    protected $casts = [
        'tanggal'      => 'date',
        'max_peserta'  => 'integer',
    ];
}
