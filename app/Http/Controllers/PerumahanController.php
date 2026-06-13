<?php

namespace App\Http\Controllers;

use App\Models\Perumahan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerumahanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Perumahan/Index', [
            'perumahan' => Perumahan::withCount('warga')->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama'       => 'required|string|max:255',
            'lokasi'     => 'required|string|max:255',
            'admin_nama' => 'required|string|max:255',
            'telepon'    => 'nullable|string|max:30',
            'email'      => 'nullable|email|max:255',
            'total_unit' => 'required|integer|min:1',
            'status'     => 'required|in:active,inactive',
            'rt'         => 'nullable|string|max:10',
            'rw'         => 'nullable|string|max:10',
            'kelurahan'  => 'nullable|string|max:100',
            'kecamatan'  => 'nullable|string|max:100',
            'kota'       => 'nullable|string|max:100',
            'provinsi'   => 'nullable|string|max:100',
            'kode_pos'   => 'nullable|string|max:20',
            'nama_ketua_rt' => 'nullable|string|max:255',
        ]);

        Perumahan::create($validated);

        return back()->with('success', 'Perumahan berhasil ditambahkan.');
    }

    public function update(Request $request, Perumahan $perumahan): RedirectResponse
    {
        $validated = $request->validate([
            'nama'       => 'required|string|max:255',
            'lokasi'     => 'required|string|max:255',
            'admin_nama' => 'required|string|max:255',
            'telepon'    => 'nullable|string|max:30',
            'email'      => 'nullable|email|max:255',
            'total_unit' => 'required|integer|min:1',
            'status'     => 'required|in:active,inactive',
            'rt'         => 'nullable|string|max:10',
            'rw'         => 'nullable|string|max:10',
            'kelurahan'  => 'nullable|string|max:100',
            'kecamatan'  => 'nullable|string|max:100',
            'kota'       => 'nullable|string|max:100',
            'provinsi'   => 'nullable|string|max:100',
            'kode_pos'   => 'nullable|string|max:20',
            'nama_ketua_rt' => 'nullable|string|max:255',
        ]);

        $perumahan->update($validated);

        return back()->with('success', 'Perumahan berhasil diperbarui.');
    }

    public function destroy(Perumahan $perumahan): RedirectResponse
    {
        $perumahan->delete();

        return back()->with('success', 'Perumahan berhasil dihapus.');
    }
}
