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
        Schema::create('pesanan_marketplaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perumahan_id')->constrained('perumahan')->cascadeOnDelete();
            $table->foreignId('marketplace_id')->constrained('marketplace')->cascadeOnDelete();
            $table->foreignId('pembeli_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('penjual_id')->constrained('users')->cascadeOnDelete();
            $table->text('pesan')->nullable();
            $table->enum('status', ['menunggu', 'diproses', 'ditolak', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesanan_marketplaces');
    }
};
