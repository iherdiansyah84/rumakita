<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use App\Models\Diskusi;
use App\Models\Marketplace;
use App\Models\Transaksi;
use App\Models\Voting;
use App\Models\Warga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pemasukan   = Transaksi::where('tipe', 'masuk')->sum('jumlah');
        $pengeluaran = Transaksi::where('tipe', 'keluar')->sum('jumlah');

        $agendaMendatang = Agenda::whereDate('tanggal', '>=', now()->toDateString())
            ->orderBy('tanggal')
            ->limit(5)
            ->get();

        $votingAktif = Voting::where('status', 'aktif')
            ->withCount('suara')
            ->latest()
            ->limit(3)
            ->get();

        $diskusiTerbaru = Diskusi::with('user:id,name')
            ->withCount('komentar')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'statistik' => [
                'total_warga'      => Warga::count(),
                'agenda_aktif'     => Agenda::whereIn('status', ['upcoming', 'ongoing'])->count(),
                'voting_aktif'     => Voting::where('status', 'aktif')->count(),
                'item_marketplace' => Marketplace::where('status', 'tersedia')->count(),
                'total_diskusi'    => Diskusi::count(),
            ],
            'keuangan' => [
                'pemasukan'   => $pemasukan,
                'pengeluaran' => $pengeluaran,
                'saldo'       => $pemasukan - $pengeluaran,
            ],
            'agenda_mendatang' => $agendaMendatang,
            'voting_aktif'     => $votingAktif,
            'diskusi_terbaru'  => $diskusiTerbaru,
        ]);
    }
}
