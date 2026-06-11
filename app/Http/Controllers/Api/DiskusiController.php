<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diskusi;
use App\Models\KomentarDiskusi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiskusiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Diskusi::with('user:id,name')
            ->withCount('komentar');

        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%')
                  ->orWhere('konten', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        $diskusi = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($diskusi);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'judul'    => 'required|string|max:255',
            'konten'   => 'required|string',
            'kategori' => 'nullable|string|max:50',
        ]);

        $diskusi = Diskusi::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'likes'   => 0,
        ]);

        $diskusi->load('user:id,name');

        return response()->json([
            'message' => 'Diskusi berhasil dibuat.',
            'diskusi' => $diskusi,
        ], 201);
    }

    public function show(Diskusi $forum): JsonResponse
    {
        $forum->load(['user:id,name', 'komentar.user:id,name']);

        return response()->json(['diskusi' => $forum]);
    }

    public function update(Request $request, Diskusi $forum): JsonResponse
    {
        abort_if($forum->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        $validated = $request->validate([
            'judul'    => 'sometimes|required|string|max:255',
            'konten'   => 'sometimes|required|string',
            'kategori' => 'nullable|string|max:50',
        ]);

        $forum->update($validated);

        return response()->json([
            'message' => 'Diskusi berhasil diperbarui.',
            'diskusi' => $forum->load('user:id,name'),
        ]);
    }

    public function destroy(Request $request, Diskusi $forum): JsonResponse
    {
        abort_if($forum->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        $forum->delete();

        return response()->json(['message' => 'Diskusi berhasil dihapus.']);
    }

    public function like(Request $request, Diskusi $diskusi): JsonResponse
    {
        $diskusi->increment('likes');

        return response()->json([
            'message' => 'Berhasil menyukai diskusi.',
            'likes'   => $diskusi->likes,
        ]);
    }

    public function storeKomentar(Request $request, Diskusi $diskusi): JsonResponse
    {
        $request->validate([
            'konten' => 'required|string',
        ]);

        $komentar = $diskusi->komentar()->create([
            'user_id' => $request->user()->id,
            'konten'  => $request->konten,
        ]);

        $komentar->load('user:id,name');

        return response()->json([
            'message'  => 'Komentar berhasil ditambahkan.',
            'komentar' => $komentar,
        ], 201);
    }

    public function destroyKomentar(Request $request, Diskusi $diskusi, KomentarDiskusi $komentar): JsonResponse
    {
        abort_if($komentar->diskusi_id !== $diskusi->id, 404);
        abort_if($komentar->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        $komentar->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus.']);
    }
}
