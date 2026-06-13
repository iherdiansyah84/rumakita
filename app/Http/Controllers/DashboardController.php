<?php

namespace App\Http\Controllers;

use App\Models\Warga;
use App\Models\Transaksi;
use App\Models\Agenda;
use App\Models\SuratMenyurat;
use App\Models\Perumahan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Data statistik
        $totalWarga = Warga::count();
        
        $pemasukan = Transaksi::where('tipe', 'in')->sum('jumlah');
        $pengeluaran = Transaksi::where('tipe', 'out')->sum('jumlah');
        $saldoKas = $pemasukan - $pengeluaran;

        $agendaAktif = Agenda::where('tanggal', '>=', now()->toDateString())->count();
        $suratPending = SuratMenyurat::where('status', 'pending')->count();
        
        $kegiatanBulanIni = Agenda::whereMonth('tanggal', now()->month)
                                  ->whereYear('tanggal', now()->year)
                                  ->count();
                                  
        $totalPerumahan = Perumahan::count(); // Super admin akan mendapatkan total semua, yang lain mendapatkan 1 (perumahan sendiri).

        // Pengumuman (Notifikasi tipe pengumuman)
        // Jika tidak ada notifikasi pengumuman, kembalikan array kosong
        $pengumumanData = $user->notifications()
            ->where('type', 'App\Notifications\PengumumanNotification')
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($notif) {
                return [
                    'id' => $notif->id,
                    'title' => $notif->data['judul'] ?? 'Pengumuman',
                    'date' => $notif->created_at->translatedFormat('d M Y'),
                    'type' => 'pengumuman'
                ];
            });

        // Aktivitas Terbaru (Gabungan Transaksi dan Surat)
        $recentTransaksi = Transaksi::with('warga')->latest('created_at')->take(5)->get()->map(function ($t) {
            $nama = $t->warga ? $t->warga->nama : 'Warga/Guest';
            return [
                'id' => 'trans_' . $t->id,
                'user' => $nama,
                'action' => $t->tipe === 'in' ? 'Membayar ' . ($t->kategori ?? 'Iuran') : 'Pengeluaran kas',
                'time' => $t->created_at->diffForHumans(),
                'status' => 'success',
                'sort_date' => $t->created_at
            ];
        });

        $recentSurat = SuratMenyurat::with('warga')->latest('created_at')->take(5)->get()->map(function ($s) {
            $nama = $s->warga ? $s->warga->nama : ($s->user ? $s->user->name : 'Warga');
            return [
                'id' => 'surat_' . $s->id,
                'user' => $nama,
                'action' => 'Mengajukan surat ' . ($s->jenis_surat ?? ''),
                'time' => $s->created_at->diffForHumans(),
                'status' => $s->status === 'approved' ? 'success' : ($s->status === 'pending' ? 'pending' : 'failed'),
                'sort_date' => $s->created_at
            ];
        });

        $recentActivities = $recentTransaksi->concat($recentSurat)
            ->sortByDesc('sort_date')
            ->take(5)
            ->values()
            ->all();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_warga' => $totalWarga,
                'saldo_kas' => $saldoKas,
                'agenda_aktif' => $agendaAktif,
                'surat_pending' => $suratPending,
                'kegiatan_bulan_ini' => $kegiatanBulanIni,
                'total_perumahan' => $totalPerumahan,
            ],
            'pengumuman' => $pengumumanData,
            'recentActivities' => $recentActivities,
        ]);
    }
}
