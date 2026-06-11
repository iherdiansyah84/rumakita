<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Galeri;
use App\Models\GaleriFoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GaleriController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Galeri::with('user:id,name')
            ->withCount('foto');

        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        $galeri = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($galeri);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'judul'            => 'required|string|max:255',
            'tanggal_kegiatan' => 'nullable|date',
            'kategori'         => 'nullable|string|max:50',
        ]);

        $galeri = Galeri::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Galeri berhasil dibuat.',
            'galeri'  => $galeri->load('user:id,name'),
        ], 201);
    }

    public function show(Galeri $galeri): JsonResponse
    {
        $galeri->load(['user:id,name', 'foto']);

        return response()->json(['galeri' => $galeri]);
    }

    public function update(Request $request, Galeri $galeri): JsonResponse
    {
        abort_if($galeri->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        $validated = $request->validate([
            'judul'            => 'sometimes|required|string|max:255',
            'tanggal_kegiatan' => 'nullable|date',
            'kategori'         => 'nullable|string|max:50',
        ]);

        $galeri->update($validated);

        return response()->json([
            'message' => 'Galeri berhasil diperbarui.',
            'galeri'  => $galeri->load('user:id,name'),
        ]);
    }

    public function destroy(Request $request, Galeri $galeri): JsonResponse
    {
        abort_if($galeri->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        foreach ($galeri->foto as $foto) {
            Storage::disk('public')->delete($foto->path);
        }

        $galeri->delete();

        return response()->json(['message' => 'Galeri berhasil dihapus.']);
    }

    public function storeFoto(Request $request, Galeri $galeri): JsonResponse
    {
        $request->validate([
            'foto'   => 'required|array|min:1',
            'foto.*' => 'required|image|max:5120',
        ]);

        $saved = [];
        foreach ($request->file('foto') as $file) {
            $path  = $file->store('galeri', 'public');
            $saved[] = $galeri->foto()->create(['path' => $path]);
        }

        return response()->json([
            'message' => count($saved) . ' foto berhasil diunggah.',
            'foto'    => $saved,
        ], 201);
    }

    public function destroyFoto(Request $request, Galeri $galeri, GaleriFoto $foto): JsonResponse
    {
        abort_if($foto->galeri_id !== $galeri->id, 404);
        abort_if($galeri->user_id !== $request->user()->id && ! $request->user()->isPengurus(), 403);

        Storage::disk('public')->delete($foto->path);
        $foto->delete();

        return response()->json(['message' => 'Foto berhasil dihapus.']);
    }
}
