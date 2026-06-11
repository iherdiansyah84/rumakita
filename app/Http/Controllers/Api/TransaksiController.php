<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransaksiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaksi::with(['warga', 'details']);

        if ($request->filled('search')) {
            $query->where('deskripsi', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal', '<=', $request->tanggal_sampai);
        }

        $transaksi = $query->latest('tanggal')->paginate($request->get('per_page', 15));

        return response()->json($transaksi);
    }

    public function summary(): JsonResponse
    {
        $pemasukan  = Transaksi::where('tipe', 'masuk')->sum('jumlah');
        $pengeluaran = Transaksi::where('tipe', 'keluar')->sum('jumlah');

        return response()->json([
            'pemasukan'   => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'saldo'       => $pemasukan - $pengeluaran,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tanggal'   => 'required|date',
            'deskripsi' => 'required|string|max:255',
            'tipe'      => 'required|in:in,out,masuk,keluar',
            'jumlah'    => 'required|integer|min:0',
            'kategori'  => 'nullable|string|max:100',
            'warga_id'  => 'nullable|exists:warga,id',
            'details'   => 'nullable|array',
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

        $transaksi = Transaksi::create([
            'tanggal'   => $validated['tanggal'],
            'deskripsi' => $validated['deskripsi'],
            'tipe'      => in_array($validated['tipe'], ['masuk', 'in']) ? 'in' : 'out',
            'kategori'  => $validated['kategori'],
            'warga_id'  => $validated['warga_id'] ?? null,
            'jumlah'    => $jumlah,
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

        return response()->json([
            'message'   => 'Transaksi berhasil ditambahkan.',
            'transaksi' => $transaksi->load('details', 'warga'),
        ], 201);
    }

    public function show(Transaksi $keuangan): JsonResponse
    {
        return response()->json(['transaksi' => $keuangan->load('details', 'warga')]);
    }

    public function update(Request $request, Transaksi $keuangan): JsonResponse
    {
        $validated = $request->validate([
            'tanggal'   => 'sometimes|required|date',
            'deskripsi' => 'sometimes|required|string|max:255',
            'tipe'      => 'sometimes|required|in:in,out,masuk,keluar',
            'jumlah'    => 'sometimes|required|integer|min:0',
            'kategori'  => 'nullable|string|max:100',
            'warga_id'  => 'nullable|exists:warga,id',
            'details'   => 'nullable|array',
            'details.*.nama_iuran' => 'required_with:details|string|max:100',
            'details.*.bulan'      => 'required_with:details|integer|min:1|max:12',
            'details.*.tahun'      => 'required_with:details|integer|min:2000',
            'details.*.jumlah'     => 'required_with:details|integer|min:1',
        ]);

        $jumlah = $validated['jumlah'] ?? $keuangan->jumlah;
        $details = $request->input('details', []);

        if (isset($validated['kategori']) && $validated['kategori'] === 'Iuran Warga' && !empty($details)) {
            $jumlah = collect($details)->sum('jumlah');
        }

        $keuangan->update([
            'tanggal'   => $validated['tanggal'] ?? $keuangan->tanggal,
            'deskripsi' => $validated['deskripsi'] ?? $keuangan->deskripsi,
            'tipe'      => isset($validated['tipe']) ? (in_array($validated['tipe'], ['masuk', 'in']) ? 'in' : 'out') : $keuangan->tipe,
            'kategori'  => $validated['kategori'] ?? $keuangan->kategori,
            'warga_id'  => array_key_exists('warga_id', $validated) ? $validated['warga_id'] : $keuangan->warga_id,
            'jumlah'    => $jumlah,
        ]);

        if (isset($validated['kategori']) && $validated['kategori'] === 'Iuran Warga') {
            $keuangan->details()->delete();
            foreach ($details as $d) {
                $keuangan->details()->create([
                    'nama_iuran' => $d['nama_iuran'],
                    'bulan'      => $d['bulan'],
                    'tahun'      => $d['tahun'],
                    'jumlah'     => $d['jumlah'],
                ]);
            }
        } elseif (isset($validated['kategori'])) {
            $keuangan->details()->delete();
        }

        return response()->json([
            'message'   => 'Transaksi berhasil diperbarui.',
            'transaksi' => $keuangan->load('details', 'warga'),
        ]);
    }

    public function destroy(Transaksi $keuangan): JsonResponse
    {
        $keuangan->delete();

        return response()->json(['message' => 'Transaksi berhasil dihapus.']);
    }
}
