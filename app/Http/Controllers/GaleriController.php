<?php

namespace App\Http\Controllers;

use App\Models\Galeri;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GaleriController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Galeri/Index', [
            'galeri' => Galeri::with(['user:id,name', 'foto'])->latest()->get()
                ->map(fn($g) => [
                    'id'               => $g->id,
                    'user_id'          => $g->user_id,
                    'uploader'         => $g->user->name ?? 'Anonim',
                    'judul'            => $g->judul,
                    'tanggal_kegiatan' => $g->tanggal_kegiatan?->format('d M Y'),
                    'kategori'         => $g->kategori,
                    'foto'             => $g->foto->map(fn($f) => [
                        'id'   => $f->id,
                        'url'  => Storage::url($f->path),
                    ]),
                    'created_at'       => $g->created_at,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'            => 'required|string|max:255',
            'tanggal_kegiatan' => 'required|date',
            'kategori'         => 'required|string|max:100',
            'foto.*'           => 'nullable|image|max:5120',
        ]);

        $galeri = Galeri::create([
            'user_id'          => $request->user()->id,
            'judul'            => $validated['judul'],
            'tanggal_kegiatan' => $validated['tanggal_kegiatan'],
            'kategori'         => $validated['kategori'],
        ]);

        if ($request->hasFile('foto')) {
            foreach ($request->file('foto') as $file) {
                $path = $file->store('galeri', 'public');
                $galeri->foto()->create(['path' => $path]);
            }
        }

        return back()->with('success', 'Album galeri berhasil dibuat.');
    }

    public function update(Request $request, Galeri $galeri): RedirectResponse
    {
        $validated = $request->validate([
            'judul'            => 'required|string|max:255',
            'tanggal_kegiatan' => 'required|date',
            'kategori'         => 'required|string|max:100',
            'foto.*'           => 'nullable|image|max:5120',
        ]);

        $galeri->update($validated);

        if ($request->hasFile('foto')) {
            foreach ($request->file('foto') as $file) {
                $path = $file->store('galeri', 'public');
                $galeri->foto()->create(['path' => $path]);
            }
        }

        return back()->with('success', 'Album galeri berhasil diperbarui.');
    }

    public function destroyFoto(\App\Models\GaleriFoto $foto): RedirectResponse
    {
        if ($foto->galeri->user_id !== auth()->id() && auth()->user()->role->name !== 'super_admin' && auth()->user()->role->name !== 'pengurus') {
            abort(403);
        }

        Storage::disk('public')->delete($foto->path);
        $foto->delete();

        return back()->with('success', 'Foto berhasil dihapus.');
    }

    public function destroy(Galeri $galeri): RedirectResponse
    {
        foreach ($galeri->foto as $foto) {
            Storage::disk('public')->delete($foto->path);
        }

        $galeri->delete();

        return back()->with('success', 'Album galeri berhasil dihapus.');
    }
}
