<?php

namespace App\Http\Controllers;

use App\Models\Marketplace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        return Inertia::render('Marketplace/Index', [
            'produk' => Marketplace::with('user:id,name')->withCount('likes')->where('status', 'active')->latest()->get()
                ->map(fn($p) => [
                    'id'        => $p->id,
                    'user_id'   => $p->user_id,
                    'penjual'   => $p->user->name ?? 'Anonim',
                    'judul'     => $p->judul,
                    'deskripsi' => $p->deskripsi,
                    'harga'     => $p->harga,
                    'kategori'  => $p->kategori,
                    'tipe_iklan'=> $p->tipe_iklan,
                    'gambar'    => is_array($p->gambar) ? array_map(fn($g) => Storage::url($g), $p->gambar) : [],
                    'status'    => $p->status,
                    'likes_count' => $p->likes_count,
                    'is_liked'  => $p->likes()->where('user_id', $userId)->exists(),
                    'created_at'=> $p->created_at,
                ]),
        ]);
    }

    public function show(Request $request, Marketplace $marketplace): Response
    {
        $marketplace->load('user:id,name');
        $marketplace->loadCount('likes');
        
        $gambar = is_array($marketplace->gambar) ? array_map(fn($g) => Storage::url($g), $marketplace->gambar) : [];
        
        return Inertia::render('Marketplace/Show', [
            'marketplace' => [
                'id' => $marketplace->id,
                'user_id' => $marketplace->user_id,
                'penjual' => $marketplace->user->name ?? 'Anonim',
                'judul' => $marketplace->judul,
                'deskripsi' => $marketplace->deskripsi,
                'harga' => $marketplace->harga,
                'kategori' => $marketplace->kategori,
                'tipe_iklan' => $marketplace->tipe_iklan,
                'gambar' => $gambar,
                'status' => $marketplace->status,
                'likes_count' => $marketplace->likes_count,
                'is_liked'  => $marketplace->likes()->where('user_id', $request->user()->id)->exists(),
                'created_at' => $marketplace->created_at,
            ]
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'required|integer|min:0',
            'kategori'  => 'required|string|max:100',
            'tipe_iklan'=> 'required|in:Jual,Sewa',
            'gambar'    => 'nullable|array',
            'gambar.*'  => 'image|max:5120',
        ]);

        $gambarPaths = [];
        if ($request->hasFile('gambar')) {
            foreach ($request->file('gambar') as $file) {
                $gambarPaths[] = $file->store('marketplace', 'public');
            }
        }

        Marketplace::create([
            'user_id'   => $request->user()->id,
            'judul'     => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'harga'     => $validated['harga'],
            'kategori'  => $validated['kategori'],
            'tipe_iklan'=> $validated['tipe_iklan'],
            'gambar'    => $gambarPaths,
            'status'    => 'active',
        ]);

        return back()->with('success', 'Iklan berhasil dipasang.');
    }

    public function update(Request $request, Marketplace $marketplace): RedirectResponse
    {
        Gate::authorize('update', $marketplace);

        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'required|integer|min:0',
            'kategori'  => 'required|string|max:100',
            'tipe_iklan'=> 'required|in:Jual,Sewa',
            'status'    => 'required|in:active,sold',
            'gambar'    => 'nullable|array',
            'gambar.*'  => 'image|max:5120',
        ]);

        if ($request->hasFile('gambar')) {
            if (is_array($marketplace->gambar)) {
                foreach ($marketplace->gambar as $oldGambar) {
                    Storage::disk('public')->delete($oldGambar);
                }
            }
            $gambarPaths = [];
            foreach ($request->file('gambar') as $file) {
                $gambarPaths[] = $file->store('marketplace', 'public');
            }
            $validated['gambar'] = $gambarPaths;
        } else {
            unset($validated['gambar']);
        }

        $marketplace->update($validated);

        return back()->with('success', 'Iklan berhasil diperbarui.');
    }

    public function destroy(Marketplace $marketplace): RedirectResponse
    {
        Gate::authorize('delete', $marketplace);

        if (is_array($marketplace->gambar)) {
            foreach ($marketplace->gambar as $oldGambar) {
                Storage::disk('public')->delete($oldGambar);
            }
        }

        $marketplace->delete();

        return back()->with('success', 'Iklan berhasil dihapus.');
    }

    public function toggleLike(Request $request, Marketplace $marketplace): RedirectResponse
    {
        $like = $marketplace->likes()->where('user_id', $request->user()->id)->first();
        if ($like) {
            $like->delete();
        } else {
            $marketplace->likes()->create(['user_id' => $request->user()->id]);
        }
        return back();
    }
}
