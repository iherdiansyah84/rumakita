<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgendaController extends Controller
{
    public function index(): Response
    {
        $warga = \App\Models\User::whereHas('role', function($q) {
            $q->where('name', 'warga');
        })->get(['id', 'name']);

        return Inertia::render('Agenda/Index', [
            'agenda' => Agenda::latest('tanggal')->get(),
            'warga' => $warga,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'            => 'required|string|max:255',
            'tanggal'          => 'required|date',
            'waktu_mulai'      => 'nullable|string|max:20',
            'waktu_selesai'    => 'nullable|string|max:20',
            'lokasi'           => 'required|string|max:255',
            'tipe'             => 'required|string|max:100',
            'penyelenggara'    => 'required|string|max:255',
            'peserta_ids'      => 'nullable|array',
            'peserta_ids.*'    => 'integer|exists:users,id',
            'reminder_minutes' => 'nullable|integer|min:1',
            'status'           => 'required|in:upcoming,ongoing,completed',
        ]);

        $agenda = Agenda::create($validated);

        if (!empty($agenda->peserta_ids)) {
            $users = \App\Models\User::whereIn('id', $agenda->peserta_ids)->get();
            if ($users->isNotEmpty()) {
                \Illuminate\Support\Facades\Notification::send($users, new \App\Notifications\AgendaNotification($agenda, false));
            }
        }

        return back()->with('success', 'Agenda berhasil ditambahkan dan notifikasi dikirim.');
    }

    public function update(Request $request, Agenda $agenda): RedirectResponse
    {
        $validated = $request->validate([
            'judul'            => 'required|string|max:255',
            'tanggal'          => 'required|date',
            'waktu_mulai'      => 'nullable|string|max:20',
            'waktu_selesai'    => 'nullable|string|max:20',
            'lokasi'           => 'required|string|max:255',
            'tipe'             => 'required|string|max:100',
            'penyelenggara'    => 'required|string|max:255',
            'peserta_ids'      => 'nullable|array',
            'peserta_ids.*'    => 'integer|exists:users,id',
            'reminder_minutes' => 'nullable|integer|min:1',
            'status'           => 'required|in:upcoming,ongoing,completed',
        ]);

        // Reset reminder_sent to false if reminder_minutes or date/time changes
        if (($agenda->reminder_minutes !== ($validated['reminder_minutes'] ?? null)) || 
            ($agenda->tanggal->format('Y-m-d') !== $validated['tanggal']) ||
            ($agenda->waktu_mulai !== ($validated['waktu_mulai'] ?? null))) {
            $validated['reminder_sent'] = false;
        }

        $agenda->update($validated);

        return back()->with('success', 'Agenda berhasil diperbarui.');
    }

    public function konfirmasi(Request $request, Agenda $agenda): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:hadir,tidak_hadir',
            'alasan' => 'nullable|string|max:500'
        ]);
        $userId = auth()->id();
        
        $hadir = $agenda->hadir_ids ?? [];
        $tidak_hadir = $agenda->tidak_hadir_ids ?? [];
        $alasanMap = $agenda->alasan_tidak_hadir ?? [];
        
        // Remove user from both arrays
        $hadir = array_values(array_filter($hadir, fn($id) => $id !== $userId));
        $tidak_hadir = array_values(array_filter($tidak_hadir, fn($id) => $id !== $userId));
        unset($alasanMap[$userId]);
        
        if ($request->status === 'hadir') {
            $hadir[] = $userId;
        } else {
            $tidak_hadir[] = $userId;
            if ($request->alasan) {
                $alasanMap[$userId] = $request->alasan;
            }
        }
        
        $agenda->update([
            'hadir_ids' => $hadir,
            'tidak_hadir_ids' => $tidak_hadir,
            'alasan_tidak_hadir' => $alasanMap,
        ]);
        
        return back()->with('success', 'Konfirmasi kehadiran berhasil disimpan.');
    }

    public function destroy(Agenda $agenda): RedirectResponse
    {
        $agenda->delete();

        return back()->with('success', 'Agenda berhasil dihapus.');
    }
}
