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
        Schema::table('perumahan', function (Blueprint $table) {
            $table->string('nama_ketua_rt')->nullable()->after('rt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perumahan', function (Blueprint $table) {
            $table->dropColumn('nama_ketua_rt');
        });
    }
};
