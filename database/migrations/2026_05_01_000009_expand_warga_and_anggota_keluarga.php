<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            $table->string('nik', 20)->nullable()->after('nama');
            $table->string('tempat_lahir')->nullable()->after('nik');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('tanggal_lahir');
            $table->string('agama', 50)->nullable()->after('jenis_kelamin');
            $table->string('pekerjaan', 100)->nullable()->after('agama');
            $table->string('status_perkawinan', 50)->nullable()->after('pekerjaan');
            $table->text('alamat_asal')->nullable()->after('status_perkawinan');
            $table->enum('tipe_dokumen', ['KTP', 'Passport'])->nullable()->after('alamat_asal');
            $table->string('no_dokumen', 30)->nullable()->after('tipe_dokumen');
            $table->string('foto_ktp')->nullable()->after('no_dokumen');
            $table->string('foto_kk')->nullable()->after('foto_ktp');
        });

        Schema::create('anggota_keluarga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warga_id')->constrained('warga')->cascadeOnDelete();
            $table->string('nama');
            $table->enum('status_hubungan', ['Suami', 'Istri', 'Anak', 'Saudara', 'Single']);
            $table->string('nik', 20)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->string('pekerjaan', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anggota_keluarga');

        Schema::table('warga', function (Blueprint $table) {
            $table->dropColumn([
                'nik', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
                'agama', 'pekerjaan', 'status_perkawinan', 'alamat_asal',
                'tipe_dokumen', 'no_dokumen', 'foto_ktp', 'foto_kk',
            ]);
        });
    }
};
