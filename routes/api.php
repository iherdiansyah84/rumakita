<?php

use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiskusiController;
use App\Http\Controllers\Api\GaleriController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\PerumahanController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VotingController;
use App\Http\Controllers\Api\WargaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rumakita REST API — consumed by Android mobile app
|--------------------------------------------------------------------------
| Base URL: /api/v1/
| Auth:     Bearer token (Laravel Sanctum personal access token)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public: Authentication ──────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('login',    [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
    });

    // ── Protected routes ────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me',      [AuthController::class, 'me']);
            Route::put('me',      [AuthController::class, 'updateProfile']);
            Route::put('me/password', [AuthController::class, 'changePassword']);
        });

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Perumahan
        Route::apiResource('perumahan', PerumahanController::class);

        // Warga + AnggotaKeluarga
        Route::apiResource('warga', WargaController::class);
        Route::prefix('warga/{warga}')->group(function () {
            Route::post('generate-user',                   [WargaController::class, 'generateUser']);
            Route::get   ('anggota-keluarga',              [WargaController::class, 'indexAnggota']);
            Route::post  ('anggota-keluarga',              [WargaController::class, 'storeAnggota']);
            Route::put   ('anggota-keluarga/{anggota}',    [WargaController::class, 'updateAnggota']);
            Route::delete('anggota-keluarga/{anggota}',    [WargaController::class, 'destroyAnggota']);
        });

        // Keuangan / Transaksi
        Route::get('keuangan/summary', [TransaksiController::class, 'summary']);
        Route::apiResource('keuangan', TransaksiController::class);

        // Agenda
        Route::apiResource('agenda', AgendaController::class);

        // Forum / Diskusi
        Route::apiResource('forum', DiskusiController::class);
        Route::prefix('forum/{diskusi}')->group(function () {
            Route::post  ('like',               [DiskusiController::class, 'like']);
            Route::post  ('komentar',           [DiskusiController::class, 'storeKomentar']);
            Route::delete('komentar/{komentar}', [DiskusiController::class, 'destroyKomentar']);
        });

        // Galeri + Foto
        Route::apiResource('galeri', GaleriController::class);
        Route::prefix('galeri/{galeri}')->group(function () {
            Route::post  ('foto',         [GaleriController::class, 'storeFoto']);
            Route::delete('foto/{foto}',  [GaleriController::class, 'destroyFoto']);
        });

        // Voting + Pilihan + Vote
        Route::apiResource('voting', VotingController::class);
        Route::prefix('voting/{voting}')->group(function () {
            Route::post  ('vote',              [VotingController::class, 'vote']);
            Route::post  ('pilihan',           [VotingController::class, 'storePilihan']);
            Route::delete('pilihan/{pilihan}', [VotingController::class, 'destroyPilihan']);
        });

        // Marketplace
        Route::apiResource('marketplace', MarketplaceController::class);

        // Users (admin / pengurus only)
        Route::apiResource('users', UserController::class);
    });
});
