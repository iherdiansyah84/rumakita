<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diskusi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('judul');
            $table->text('konten');
            $table->string('kategori')->default('Lainnya');
            $table->unsignedInteger('likes')->default(0);
            $table->timestamps();
        });

        Schema::create('komentar_diskusi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diskusi_id')->constrained('diskusi')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('konten');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('komentar_diskusi');
        Schema::dropIfExists('diskusi');
    }
};
