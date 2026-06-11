<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voting', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->date('deadline')->nullable();
            $table->enum('status', ['active', 'completed'])->default('active');
            $table->timestamps();
        });

        Schema::create('voting_pilihan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voting_id')->constrained('voting')->cascadeOnDelete();
            $table->string('nama');
            $table->unsignedInteger('votes')->default(0);
            $table->timestamps();
        });

        Schema::create('voting_suara', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voting_id')->constrained('voting')->cascadeOnDelete();
            $table->foreignId('voting_pilihan_id')->constrained('voting_pilihan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['voting_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voting_suara');
        Schema::dropIfExists('voting_pilihan');
        Schema::dropIfExists('voting');
    }
};
