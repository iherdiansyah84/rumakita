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
            $surat = SuratMenyurat::with(['user:id,name', 'warga', 'anggotaKeluarga'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
                
            $pilihanWarga = \App\Models\Warga::with('anggotaKeluarga')
                ->where('email', $user->email)
                ->get();
        } else {
            // Admin/Pengurus melihat semua surat
            $surat = SuratMenyurat::with(['user:id,name,email', 'warga', 'anggotaKeluarga'])
                ->orderBy('created_at', 'desc')
                ->get();
                
            $pilihanWarga = \App\Models\Warga::with('anggotaKeluarga')
                ->where('perumahan_id', $user->perumahan_id ?? 1)
                ->get();
        }

        // Keep backward compatibility for old surat
        $emails = $surat->whereNull('warga_id')->pluck('user.email')->filter()->unique();
        if ($emails->isNotEmpty()) {
            $wargas = \App\Models\Warga::whereIn('email', $emails)->get()->keyBy('email');
            $surat->each(function($s) use ($wargas) {
                if (!$s->warga_id && $s->user && $s->user->email) {
                    $w = $wargas->get($s->user->email);
                    if ($w) {
                        $s->user->blok_rumah = $w->blok;
                    }
                }
            });
        }

        return Inertia::render('Surat/Index', [
            'surat' => $surat,
            'pilihanWarga' => $pilihanWarga
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'warga_id' => 'required|exists:warga,id',
            'anggota_keluarga_id' => 'nullable|exists:anggota_keluarga,id',
            'jenis_surat' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'keterangan_tambahan' => 'nullable|string',
        ]);

        SuratMenyurat::create([
            'perumahan_id' => auth()->user()->perumahan_id ?? 1,
            'user_id' => auth()->id(),
            'warga_id' => $validated['warga_id'],
            'anggota_keluarga_id' => $validated['anggota_keluarga_id'] ?? null,
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

        $surat->load(['user', 'warga', 'anggotaKeluarga']);
        
        // Handle new data structure where warga_id is populated
        if ($surat->warga) {
            $warga = $surat->warga;
            $pemohon = $surat->anggotaKeluarga ?: $surat->warga;
        } else {
            // Backward compatibility for old letters
            $warga = \App\Models\Warga::where('email', $surat->user->email)->first();
            $pemohon = $warga;
        }
        
        return view('surat.cetak', [
            'surat' => $surat,
            'warga' => $warga,
            'pemohon' => $pemohon
        ]);
    }
}
