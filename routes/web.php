<?php

use App\Http\Controllers\AgendaController;
use App\Http\Controllers\DiskusiController;
use App\Http\Controllers\GaleriController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\PerumahanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VotingController;
use App\Http\Controllers\WargaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');

    // ─── User Management ─────────────────────────────────────────────────────
    Route::middleware('permission:users,view')->group(function () {
        Route::get('/users',            [UserController::class, 'index'])->name('users');
        Route::post('/users',           [UserController::class, 'store'])->middleware('permission:users,create')->name('users.store');
        Route::patch('/users/{user}',   [UserController::class, 'update'])->middleware('permission:users,update')->name('users.update');
        Route::delete('/users/{user}',  [UserController::class, 'destroy'])->middleware('permission:users,delete')->name('users.destroy');
    });

    // ─── Perumahan ────────────────────────────────────────────────────────────
    Route::get('/perumahan', [PerumahanController::class, 'index'])->middleware('permission:perumahan,view')->name('perumahan');
    Route::post('/perumahan',                [PerumahanController::class, 'store'])->middleware('permission:perumahan,create')->name('perumahan.store');
    Route::patch('/perumahan/{perumahan}',   [PerumahanController::class, 'update'])->middleware('permission:perumahan,update')->name('perumahan.update');
    Route::delete('/perumahan/{perumahan}',  [PerumahanController::class, 'destroy'])->middleware('permission:perumahan,delete')->name('perumahan.destroy');

    // ─── Warga ────────────────────────────────────────────────────────────────
    Route::get('/warga', [WargaController::class, 'index'])->middleware('permission:warga,view')->name('warga');
    Route::post('/warga',             [WargaController::class, 'store'])->middleware('permission:warga,create')->name('warga.store');
    Route::patch('/warga/{warga}',    [WargaController::class, 'update'])->middleware('permission:warga,update')->name('warga.update');
    Route::delete('/warga/{warga}',   [WargaController::class, 'destroy'])->middleware('permission:warga,delete')->name('warga.destroy');

    Route::post('/warga/{warga}/generate-user', [WargaController::class, 'generateUser'])->middleware('permission:warga,update')->name('warga.generate-user');

    // ─── Keuangan ─────────────────────────────────────────────────────────────
    Route::get('/keuangan',               [TransaksiController::class, 'index'])->middleware('permission:keuangan,view')->name('keuangan');
    Route::post('/keuangan',              [TransaksiController::class, 'store'])->middleware('permission:keuangan,create')->name('transaksi.store');
    Route::patch('/keuangan/{transaksi}', [TransaksiController::class, 'update'])->middleware('permission:keuangan,update')->name('transaksi.update');
    Route::delete('/keuangan/{transaksi}',[TransaksiController::class, 'destroy'])->middleware('permission:keuangan,delete')->name('transaksi.destroy');

    // ─── Tagihan & Master Iuran ──────────────────────────────────────────────────
    Route::get('/tagihan',                                [\App\Http\Controllers\TagihanController::class, 'index'])->middleware('permission:tagihan,view')->name('tagihan.index');
    Route::post('/tagihan/master',                        [\App\Http\Controllers\TagihanController::class, 'storeMaster'])->middleware('permission:tagihan,create')->name('tagihan.master.store');
    Route::delete('/tagihan/master/{master}',             [\App\Http\Controllers\TagihanController::class, 'destroyMaster'])->middleware('permission:tagihan,delete')->name('tagihan.master.destroy');
    Route::post('/tagihan/master/{master}/generate',      [\App\Http\Controllers\TagihanController::class, 'generateTagihan'])->middleware('permission:tagihan,create')->name('tagihan.generate');
    Route::post('/tagihan/{tagihan}/bayar',               [\App\Http\Controllers\TagihanController::class, 'bayarTagihan'])->middleware('permission:tagihan,update')->name('tagihan.bayar');

    Route::get('/pembayaran-iuran',                       [\App\Http\Controllers\PembayaranIuranController::class, 'index'])->middleware('permission:pembayaran,view')->name('pembayaran.index');
    Route::post('/pembayaran-iuran',                      [\App\Http\Controllers\PembayaranIuranController::class, 'store'])->middleware('permission:pembayaran,create')->name('pembayaran.store');

    // ─── Agenda ───────────────────────────────────────────────────────────────
    Route::get('/agenda', [AgendaController::class, 'index'])->middleware('permission:agenda,view')->name('agenda');
    Route::post('/agenda',             [AgendaController::class, 'store'])->middleware('permission:agenda,create')->name('agenda.store');
    Route::patch('/agenda/{agenda}',   [AgendaController::class, 'update'])->middleware('permission:agenda,update')->name('agenda.update');
    Route::delete('/agenda/{agenda}',  [AgendaController::class, 'destroy'])->middleware('permission:agenda,delete')->name('agenda.destroy');

    // ─── Forum ────────────────────────────────────────────────────────────────
    Route::get('/forum',                              [DiskusiController::class, 'index'])->middleware('permission:forum,view')->name('forum');
    Route::post('/forum',                             [DiskusiController::class, 'store'])->middleware('permission:forum,create')->name('diskusi.store');
    Route::patch('/forum/{diskusi}',                  [DiskusiController::class, 'update'])->middleware('permission:forum,update')->name('diskusi.update');
    Route::delete('/forum/{diskusi}',                 [DiskusiController::class, 'destroy'])->middleware('permission:forum,delete')->name('diskusi.destroy');
    Route::post('/forum/{diskusi}/like',              [DiskusiController::class, 'like'])->middleware('permission:forum,like')->name('diskusi.like');
    Route::post('/forum/{diskusi}/komentar',          [DiskusiController::class, 'storeKomentar'])->middleware('permission:forum,comment')->name('diskusi.komentar.store');

    // ─── Galeri ───────────────────────────────────────────────────────────────
    Route::get('/galeri',             [GaleriController::class, 'index'])->middleware('permission:galeri,view')->name('galeri');
    Route::post('/galeri',            [GaleriController::class, 'store'])->middleware('permission:galeri,create')->name('galeri.store');
    Route::patch('/galeri/{galeri}',  [GaleriController::class, 'update'])->middleware('permission:galeri,update')->name('galeri.update');
    Route::delete('/galeri/{galeri}', [GaleriController::class, 'destroy'])->middleware('permission:galeri,delete')->name('galeri.destroy');

    // ─── Voting ───────────────────────────────────────────────────────────────
    Route::get('/voting',                [VotingController::class, 'index'])->middleware('permission:voting,view')->name('voting');
    Route::post('/voting/{voting}/vote', [VotingController::class, 'vote'])->middleware('permission:voting,vote')->name('voting.vote');
    Route::post('/voting',              [VotingController::class, 'store'])->middleware('permission:voting,create')->name('voting.store');
    Route::patch('/voting/{voting}',    [VotingController::class, 'update'])->middleware('permission:voting,update')->name('voting.update');
    Route::delete('/voting/{voting}',   [VotingController::class, 'destroy'])->middleware('permission:voting,delete')->name('voting.destroy');

    // ─── Marketplace ──────────────────────────────────────────────────────────
    Route::get('/marketplace',                       [MarketplaceController::class, 'index'])->middleware('permission:marketplace,view')->name('marketplace');
    Route::post('/marketplace',                      [MarketplaceController::class, 'store'])->middleware('permission:marketplace,create')->name('marketplace.store');
    Route::post('/marketplace/{marketplace}/update', [MarketplaceController::class, 'update'])->middleware('permission:marketplace,update')->name('marketplace.update');
    Route::delete('/marketplace/{marketplace}',      [MarketplaceController::class, 'destroy'])->middleware('permission:marketplace,delete')->name('marketplace.destroy');

    // ─── Laporan ──────────────────────────────────────────────────────────────
    Route::get('/laporan', fn() => Inertia::render('Laporan/Index'))->middleware('permission:laporan,view')->name('laporan');

    // ─── Pengaturan: Role Management ──────────────────────────────────────────
    Route::prefix('pengaturan')->group(function () {
        Route::get('/roles',            [RoleController::class, 'index'])->middleware('permission:roles,view')->name('pengaturan.roles');
        Route::post('/roles',           [RoleController::class, 'store'])->middleware('permission:roles,create')->name('pengaturan.roles.store');
        Route::patch('/roles/{role}',   [RoleController::class, 'update'])->middleware('permission:roles,update')->name('pengaturan.roles.update');
        Route::delete('/roles/{role}',  [RoleController::class, 'destroy'])->middleware('permission:roles,delete')->name('pengaturan.roles.destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
