<?php

namespace App\Http\Controllers;

use App\Models\SuratMenyurat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SuratMenyuratController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        
        if ($user->role->name === 'warga') {
            // Warga hanya melihat surat miliknya sendiri
            $surat = SuratMenyurat::with('user:id,name')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Admin/Pengurus melihat semua surat
            $surat = SuratMenyurat::with('user:id,name,blok_rumah,nomor_rumah')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('Surat/Index', [
            'surat' => $surat
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'jenis_surat' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'keterangan_tambahan' => 'nullable|string',
        ]);

        SuratMenyurat::create([
            'perumahan_id' => auth()->user()->perumahan_id ?? 1,
            'user_id' => auth()->id(),
            'jenis_surat' => $validated['jenis_surat'],
            'keperluan' => $validated['keperluan'],
            'keterangan_tambahan' => $validated['keterangan_tambahan'],
            'status' => 'pending'
        ]);

        return back()->with('success', 'Pengajuan surat berhasil dikirim.');
    }

    public function update(Request $request, SuratMenyurat $surat): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,diproses,selesai,ditolak',
            'catatan_admin' => 'nullable|string',
            'nomor_surat' => 'nullable|string',
        ]);

        $surat->update($validated);

        return back()->with('success', 'Status surat berhasil diperbarui.');
    }

    public function destroy(SuratMenyurat $surat): RedirectResponse
    {
        $surat->delete();
        return back()->with('success', 'Surat berhasil dihapus.');
    }

    public function cetak(SuratMenyurat $surat)
    {
        // Pastikan hanya pengurus atau pemilik surat yang bisa mencetak
        if (auth()->user()->role->name === 'warga' && $surat->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $surat->load('user');
        
        return view('surat.cetak', [
            'surat' => $surat
        ]);
    }
}
