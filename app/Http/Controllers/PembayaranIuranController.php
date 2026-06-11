<?php

namespace App\Http\Controllers;

use App\Models\PembayaranIuran;
use App\Models\PembayaranIuranBukti;
use App\Models\Tagihan;
use App\Models\Transaksi;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PembayaranIuranController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isWargaRole = $user->isWarga();
        $linkedWargaId = null;

        $queryWarga = Warga::where('perumahan_id', $user->perumahan_id)
            ->where('status_tinggal', '!=', 'Pindah');

        if ($isWargaRole) {
            $queryWarga->where('email', $user->email);
        }

        $wargas = $queryWarga->with(['tagihans' => function($q) {
                $q->where('status', 'belum_lunas')->with('masterIuran.details');
            }])
            ->get();

        if ($isWargaRole && $wargas->isNotEmpty()) {
            $linkedWargaId = $wargas->first()->id;
        }

        $pembayarans = PembayaranIuran::where('perumahan_id', $user->perumahan_id);

        if ($isWargaRole && $linkedWargaId) {
            $pembayarans->where('warga_id', $linkedWargaId);
        }

        $pembayarans = $pembayarans->with(['warga', 'buktis', 'tagihans.masterIuran'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Keuangan/Pembayaran', [
            'wargas' => $wargas,
            'pembayarans' => $pembayarans,
            'isWargaRole' => $isWargaRole,
            'linkedWargaId' => $linkedWargaId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warga_id' => 'required|exists:warga,id',
            'tagihan_ids' => 'required|array|min:1',
            'tagihan_ids.*' => 'exists:tagihans,id',
            'catatan' => 'nullable|string',
            'buktis' => 'nullable|array',
            'buktis.*' => 'file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $tagihans = Tagihan::whereIn('id', $validated['tagihan_ids'])->with('masterIuran')->get();
            $total = $tagihans->sum(function($t) {
                return $t->masterIuran->total_iuran;
            });

            $pembayaran = PembayaranIuran::create([
                'perumahan_id' => $request->user()->perumahan_id,
                'warga_id' => $validated['warga_id'],
                'tanggal' => now(),
                'total' => $total,
                'status' => 'lunas',
                'catatan' => $validated['catatan'] ?? null,
            ]);

            foreach ($tagihans as $tagihan) {
                $tagihan->update([
                    'status' => 'lunas',
                    'tanggal_bayar' => now(),
                    'pembayaran_iuran_id' => $pembayaran->id,
                ]);
            }

            if ($request->hasFile('buktis')) {
                foreach ($request->file('buktis') as $file) {
                    $path = $file->store('bukti_pembayaran', 'public');
                    PembayaranIuranBukti::create([
                        'pembayaran_iuran_id' => $pembayaran->id,
                        'file_path' => $path,
                    ]);
                }
            }

            $warga = Warga::find($validated['warga_id']);
            $months = $tagihans->map(function($t) {
                return date('F', mktime(0, 0, 0, $t->masterIuran->bulan, 10)) . ' ' . $t->masterIuran->tahun;
            })->join(', ');

            Transaksi::create([
                'perumahan_id' => $request->user()->perumahan_id,
                'tanggal' => now(),
                'deskripsi' => "Pembayaran Iuran Warga: $warga->nama (Blok $warga->blok) - Bulan: $months",
                'tipe' => 'in',
                'jumlah' => $total,
                'kategori' => 'Iuran Warga',
                'warga_id' => $warga->id,
            ]);
        });

        return redirect()->back()->with('success', 'Pembayaran berhasil disimpan dan tagihan telah dilunasi.');
    }
}
