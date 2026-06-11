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
        Schema::table('warga', function (Blueprint $table) {
            $table->enum('status_tinggal', ['Tetap', 'Kontrak', 'Pindah'])->default('Tetap')->after('status_iuran');
            $table->text('alamat_pindah')->nullable()->after('status_tinggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            $table->dropColumn(['status_tinggal', 'alamat_pindah']);
        });
    }
};
