<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterIuranDetail extends Model
{
    protected $fillable = ['master_iuran_id', 'nama_iuran', 'jumlah'];

    public function masterIuran()
    {
        return $this->belongsTo(MasterIuran::class);
    }
}
