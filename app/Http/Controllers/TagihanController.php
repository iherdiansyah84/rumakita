<?php

namespace App\Http\Controllers;

use App\Models\MasterIuran;
use App\Models\Tagihan;
use App\Models\Transaksi;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TagihanController extends Controller
{
    public function index()
    {
        $masters = MasterIuran::with(['details', 'tagihans.warga'])->orderBy('tahun', 'desc')->orderBy('bulan', 'desc')->get();
        return Inertia::render('Keuangan/Tagihan', [
            'masterIurans' => $masters
        ]);
    }

    public function storeMaster(Request $request)
    {
        $validated = $request->validate([
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2000',
            'details' => 'required|array',
            'details.*.nama_iuran' => 'required|string',
            'details.*.jumlah' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $total = collect($validated['details'])->sum('jumlah');

            $master = MasterIuran::create([
                'perumahan_id' => $request->user()->perumahan_id,
                'bulan' => $validated['bulan'],
                'tahun' => $validated['tahun'],
                'total_iuran' => $total,
            ]);

            foreach ($validated['details'] as $detail) {
                $master->details()->create([
                    'nama_iuran' => $detail['nama_iuran'],
                    'jumlah' => $detail['jumlah'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Master Iuran berhasil dibuat.');
    }

    public function generateTagihan(MasterIuran $master)
    {
        $wargaList = Warga::where('perumahan_id', $master->perumahan_id)->where('status_tinggal', '!=', 'Pindah')->get();

        DB::transaction(function () use ($master, $wargaList) {
            foreach ($wargaList as $warga) {
                // Check if already generated
                $exists = Tagihan::where('master_iuran_id', $master->id)->where('warga_id', $warga->id)->exists();
                if (!$exists) {
                    Tagihan::create([
                        'master_iuran_id' => $master->id,
                        'warga_id' => $warga->id,
                        'status' => 'belum_lunas',
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Tagihan berhasil digenerate untuk semua warga aktif.');
    }

    public function bayarTagihan(Tagihan $tagihan, Request $request)
    {
        DB::transaction(function () use ($tagihan, $request) {
            $tagihan->update([
                'status' => 'lunas',
                'tanggal_bayar' => now(),
            ]);

            $master = $tagihan->masterIuran;
            $warga = $tagihan->warga;

            $namaBulan = date('F', mktime(0, 0, 0, $master->bulan, 10));

            Transaksi::create([
                'perumahan_id' => $request->user()->perumahan_id,
                'tanggal' => now(),
                'deskripsi' => "Pembayaran Iuran $namaBulan $master->tahun - $warga->nama (Blok $warga->blok)",
                'tipe' => 'in',
                'jumlah' => $master->total_iuran,
                'kategori' => 'Iuran Warga',
                'warga_id' => $warga->id,
            ]);
        });

        return redirect()->back()->with('success', 'Tagihan berhasil dibayar dan transaksi kas telah dicatat.');
    }

    public function destroyMaster(MasterIuran $master)
    {
        $master->delete();
        return redirect()->back()->with('success', 'Master Iuran berhasil dihapus.');
    }
}
