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
        'lokasi', 'tipe', 'penyelenggara', 'peserta_ids', 'hadir_ids', 'tidak_hadir_ids', 'alasan_tidak_hadir', 'reminder_minutes', 'reminder_sent', 'status',
    ];

    protected $casts = [
        'tanggal'      => 'date',
        'peserta_ids'  => 'array',
        'hadir_ids'    => 'array',
        'tidak_hadir_ids' => 'array',
        'alasan_tidak_hadir' => 'array',
        'reminder_minutes' => 'integer',
        'reminder_sent' => 'boolean',
    ];
}
