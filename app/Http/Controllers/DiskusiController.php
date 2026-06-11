<?php

namespace App\Http\Controllers;

use App\Models\Diskusi;
use App\Models\KomentarDiskusi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiskusiController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Forum/Index', [
            'diskusi' => Diskusi::with(['user:id,name', 'komentar'])->latest()->get()
                ->map(fn($d) => [
                    'id'            => $d->id,
                    'user_id'       => $d->user_id,
                    'user'          => $d->user->name ?? 'Anonim',
                    'judul'         => $d->judul,
                    'konten'        => $d->konten,
                    'kategori'      => $d->kategori,
                    'likes'         => $d->likes,
                    'komentar_count'=> $d->komentar->count(),
                    'created_at'    => $d->created_at,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'    => 'required|string|max:255',
            'konten'   => 'required|string',
            'kategori' => 'required|string|max:100',
        ]);

        $validated['user_id'] = $request->user()->id;

        Diskusi::create($validated);

        return back()->with('success', 'Diskusi berhasil dibuat.');
    }

    public function update(Request $request, Diskusi $diskusi): RedirectResponse
    {
        $this->authorize('update', $diskusi);

        $validated = $request->validate([
            'judul'    => 'required|string|max:255',
            'konten'   => 'required|string',
            'kategori' => 'required|string|max:100',
        ]);

        $diskusi->update($validated);

        return back()->with('success', 'Diskusi berhasil diperbarui.');
    }

    public function destroy(Diskusi $diskusi): RedirectResponse
    {
        $this->authorize('delete', $diskusi);

        $diskusi->delete();

        return back()->with('success', 'Diskusi berhasil dihapus.');
    }

    public function like(Diskusi $diskusi): RedirectResponse
    {
        $diskusi->increment('likes');

        return back();
    }

    public function storeKomentar(Request $request, Diskusi $diskusi): RedirectResponse
    {
        $validated = $request->validate([
            'konten' => 'required|string|max:1000',
        ]);

        KomentarDiskusi::create([
            'diskusi_id' => $diskusi->id,
            'user_id'    => $request->user()->id,
            'konten'     => $validated['konten'],
        ]);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }
}
