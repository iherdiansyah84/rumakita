<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agenda', function (Blueprint $table) {
            $table->dropColumn('max_peserta');
            $table->json('peserta_ids')->nullable();
            $table->integer('reminder_minutes')->nullable();
            $table->boolean('reminder_sent')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('agenda', function (Blueprint $table) {
            $table->integer('max_peserta')->nullable();
            $table->dropColumn(['peserta_ids', 'reminder_minutes', 'reminder_sent']);
        });
    }
};
