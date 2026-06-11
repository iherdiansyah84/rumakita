<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Warga;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiController extends Controller
{
    public function index(): Response
    {
        $transaksi = Transaksi::with(['warga', 'details'])->latest('tanggal')->get();

        $pemasukan   = $transaksi->where('tipe', 'in')->sum('jumlah');
        $pengeluaran = $transaksi->where('tipe', 'out')->sum('jumlah');

        $wargaList = Warga::select('id', 'nama', 'blok')->orderBy('nama')->get();

        return Inertia::render('Keuangan/Index', [
            'transaksi'   => $transaksi,
            'wargaList'   => $wargaList,
            'stats'       => [
                'saldo'       => $pemasukan - $pengeluaran,
                'pemasukan'   => $pemasukan,
                'pengeluaran' => $pengeluaran,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal'    => 'required|date',
            'deskripsi'  => 'required|string|max:255',
            'tipe'       => 'required|in:in,out',
            'jumlah'     => 'required|integer|min:0',
            'kategori'   => 'nullable|string|max:100',
            'warga_id'   => 'nullable|exists:warga,id',
            'details'    => 'nullable|array',
            'details.*.nama_iuran' => 'required_with:details|string|max:100',
            'details.*.bulan'      => 'required_with:details|integer|min:1|max:12',
            'details.*.tahun'      => 'required_with:details|integer|min:2000',
            'details.*.jumlah'     => 'required_with:details|integer|min:1',
        ]);

        $jumlah = $validated['jumlah'];
        $details = $request->input('details', []);

        // If it's an Iuran with details, recalculate total
        if ($validated['kategori'] === 'Iuran Warga' && !empty($details)) {
            $jumlah = collect($details)->sum('jumlah');
        }

        $transaksi = Transaksi::create([
            'tanggal'    => $validated['tanggal'],
            'deskripsi'  => $validated['deskripsi'],
            'tipe'       => $validated['tipe'],
            'kategori'   => $validated['kategori'],
            'warga_id'   => $validated['warga_id'] ?? null,
            'jumlah'     => $jumlah,
            'perumahan_id' => auth()->user()->perumahan_id,
        ]);

        if ($validated['kategori'] === 'Iuran Warga' && !empty($details)) {
            foreach ($details as $d) {
                $transaksi->details()->create([
                    'nama_iuran' => $d['nama_iuran'],
                    'bulan'      => $d['bulan'],
                    'tahun'      => $d['tahun'],
                    'jumlah'     => $d['jumlah'],
                ]);
            }
        }

        return back()->with('success', 'Transaksi berhasil dicatat.');
    }

    public function update(Request $request, Transaksi $transaksi): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal'    => 'required|date',
            'deskripsi'  => 'required|string|max:255',
            'tipe'       => 'required|in:in,out',
            'jumlah'     => 'required|integer|min:0',
            'kategori'   => 'nullable|string|max:100',
            'warga_id'   => 'nullable|exists:warga,id',
            'details'    => 'nullable|array',
            'details.*.nama_iuran' => 'required_with:details|string|max:100',
            'details.*.bulan'      => 'required_with:details|integer|min:1|max:12',
            'details.*.tahun'      => 'required_with:details|integer|min:2000',
            'details.*.jumlah'     => 'required_with:details|integer|min:1',
        ]);

        $jumlah = $validated['jumlah'];
        $details = $request->input('details', []);

        if ($validated['kategori'] === 'Iuran Warga' && !empty($details)) {
            $jumlah = collect($details)->sum('jumlah');
        }

        $transaksi->update([
            'tanggal'    => $validated['tanggal'],
            'deskripsi'  => $validated['deskripsi'],
            'tipe'       => $validated['tipe'],
            'kategori'   => $validated['kategori'],
            'warga_id'   => $validated['warga_id'] ?? null,
            'jumlah'     => $jumlah,
        ]);

        if ($validated['kategori'] === 'Iuran Warga') {
            $transaksi->details()->delete();
            foreach ($details as $d) {
                $transaksi->details()->create([
                    'nama_iuran' => $d['nama_iuran'],
                    'bulan'      => $d['bulan'],
                    'tahun'      => $d['tahun'],
                    'jumlah'     => $d['jumlah'],
                ]);
            }
        } else {
            $transaksi->details()->delete();
        }

        return back()->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(Transaksi $transaksi): RedirectResponse
    {
        $transaksi->delete();

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }
}
