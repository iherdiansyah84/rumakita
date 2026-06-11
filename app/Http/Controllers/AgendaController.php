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
        return Inertia::render('Agenda/Index', [
            'agenda' => Agenda::latest('tanggal')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'         => 'required|string|max:255',
            'tanggal'       => 'required|date',
            'waktu_mulai'   => 'nullable|string|max:20',
            'waktu_selesai' => 'nullable|string|max:20',
            'lokasi'        => 'required|string|max:255',
            'tipe'          => 'required|string|max:100',
            'penyelenggara' => 'required|string|max:255',
            'max_peserta'   => 'nullable|integer|min:1',
            'status'        => 'required|in:upcoming,ongoing,completed',
        ]);

        Agenda::create($validated);

        return back()->with('success', 'Agenda berhasil ditambahkan.');
    }

    public function update(Request $request, Agenda $agenda): RedirectResponse
    {
        $validated = $request->validate([
            'judul'         => 'required|string|max:255',
            'tanggal'       => 'required|date',
            'waktu_mulai'   => 'nullable|string|max:20',
            'waktu_selesai' => 'nullable|string|max:20',
            'lokasi'        => 'required|string|max:255',
            'tipe'          => 'required|string|max:100',
            'penyelenggara' => 'required|string|max:255',
            'max_peserta'   => 'nullable|integer|min:1',
            'status'        => 'required|in:upcoming,ongoing,completed',
        ]);

        $agenda->update($validated);

        return back()->with('success', 'Agenda berhasil diperbarui.');
    }

    public function destroy(Agenda $agenda): RedirectResponse
    {
        $agenda->delete();

        return back()->with('success', 'Agenda berhasil dihapus.');
    }
}
