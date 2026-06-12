<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('surat_menyurats', function (Blueprint $table) {
            $table->foreignId('warga_id')->nullable()->constrained('warga')->onDelete('set null');
            $table->foreignId('anggota_keluarga_id')->nullable()->constrained('anggota_keluarga')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_menyurats', function (Blueprint $table) {
            $table->dropForeign(['warga_id']);
            $table->dropForeign(['anggota_keluarga_id']);
            $table->dropColumn(['warga_id', 'anggota_keluarga_id']);
        });
    }
};
