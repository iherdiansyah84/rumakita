<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Marketplace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MarketplaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Marketplace::with('user:id,name');

        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%')
                  ->orWhere('deskripsi', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('harga_min')) {
            $query->where('harga', '>=', $request->harga_min);
        }

        if ($request->filled('harga_max')) {
            $query->where('harga', '<=', $request->harga_max);
        }

        $items = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'required|integer|min:0',
            'kategori'  => 'nullable|string|max:50',
            'gambar'    => 'nullable|image|max:5120',
            'status'    => 'nullable|in:tersedia,terjual,dihapus',
        ]);

        $gambarPath = null;
        if ($request->hasFile('gambar')) {
            $gambarPath = $request->file('gambar')->store('marketplace', 'public');
        }

        $item = Marketplace::create([
            'user_id'   => $request->user()->id,
            'judul'     => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'harga'     => $validated['harga'],
            'kategori'  => $validated['kategori'] ?? null,
            'gambar'    => $gambarPath,
            'status'    => $validated['status'] ?? 'tersedia',
        ]);

        return response()->json([
            'message' => 'Item berhasil ditambahkan.',
            'item'    => $item->load('user:id,name'),
        ], 201);
    }

    public function show(Marketplace $marketplace): JsonResponse
    {
        return response()->json([
            'item' => $marketplace->load('user:id,name'),
        ]);
    }

    public function update(Request $request, Marketplace $marketplace): JsonResponse
    {
        abort_if($marketplace->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        $validated = $request->validate([
            'judul'     => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'sometimes|required|integer|min:0',
            'kategori'  => 'nullable|string|max:50',
            'gambar'    => 'nullable|image|max:5120',
            'status'    => 'nullable|in:tersedia,terjual,dihapus',
        ]);

        if ($request->hasFile('gambar')) {
            if ($marketplace->gambar) {
                Storage::disk('public')->delete($marketplace->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('marketplace', 'public');
        }

        $marketplace->update($validated);

        return response()->json([
            'message' => 'Item berhasil diperbarui.',
            'item'    => $marketplace->load('user:id,name'),
        ]);
    }

    public function destroy(Request $request, Marketplace $marketplace): JsonResponse
    {
        abort_if($marketplace->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        if ($marketplace->gambar) {
            Storage::disk('public')->delete($marketplace->gambar);
        }

        $marketplace->delete();

        return response()->json(['message' => 'Item berhasil dihapus.']);
    }
}
