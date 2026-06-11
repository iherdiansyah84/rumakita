<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perumahan_id')->nullable()->constrained('perumahan')->nullOnDelete();
            $table->string('nama');
            $table->string('blok');
            $table->string('no_hp')->nullable();
            $table->string('email')->nullable();
            $table->enum('status_iuran', ['lunas', 'pending', 'tunggak'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warga');
    }
};
