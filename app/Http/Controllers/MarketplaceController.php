<?php

namespace App\Http\Controllers;

use App\Models\Marketplace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Marketplace/Index', [
            'produk' => Marketplace::with('user:id,name')->where('status', 'active')->latest()->get()
                ->map(fn($p) => [
                    'id'        => $p->id,
                    'user_id'   => $p->user_id,
                    'penjual'   => $p->user->name ?? 'Anonim',
                    'judul'     => $p->judul,
                    'deskripsi' => $p->deskripsi,
                    'harga'     => $p->harga,
                    'kategori'  => $p->kategori,
                    'gambar'    => $p->gambar ? Storage::url($p->gambar) : null,
                    'status'    => $p->status,
                    'created_at'=> $p->created_at,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'required|integer|min:0',
            'kategori'  => 'required|string|max:100',
            'gambar'    => 'nullable|image|max:5120',
        ]);

        $gambarPath = null;
        if ($request->hasFile('gambar')) {
            $gambarPath = $request->file('gambar')->store('marketplace', 'public');
        }

        Marketplace::create([
            'user_id'   => $request->user()->id,
            'judul'     => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'harga'     => $validated['harga'],
            'kategori'  => $validated['kategori'],
            'gambar'    => $gambarPath,
            'status'    => 'active',
        ]);

        return back()->with('success', 'Iklan berhasil dipasang.');
    }

    public function update(Request $request, Marketplace $marketplace): RedirectResponse
    {
        $this->authorize('update', $marketplace);

        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'required|integer|min:0',
            'kategori'  => 'required|string|max:100',
            'status'    => 'required|in:active,sold',
            'gambar'    => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('gambar')) {
            if ($marketplace->gambar) {
                Storage::disk('public')->delete($marketplace->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('marketplace', 'public');
        }

        $marketplace->update($validated);

        return back()->with('success', 'Iklan berhasil diperbarui.');
    }

    public function destroy(Marketplace $marketplace): RedirectResponse
    {
        $this->authorize('delete', $marketplace);

        if ($marketplace->gambar) {
            Storage::disk('public')->delete($marketplace->gambar);
        }

        $marketplace->delete();

        return back()->with('success', 'Iklan berhasil dihapus.');
    }
}
