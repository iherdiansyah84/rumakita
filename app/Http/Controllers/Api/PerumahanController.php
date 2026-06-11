<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perumahan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerumahanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Perumahan::withCount('warga');

        if ($request->filled('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('lokasi', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perumahan = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($perumahan);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'       => 'required|string|max:255',
            'lokasi'     => 'required|string|max:255',
            'admin_nama' => 'nullable|string|max:255',
            'telepon'    => 'nullable|string|max:20',
            'email'      => 'nullable|email|max:255',
            'total_unit' => 'nullable|integer|min:0',
            'status'     => 'nullable|in:aktif,nonaktif',
        ]);

        $perumahan = Perumahan::create($validated);

        return response()->json([
            'message'   => 'Perumahan berhasil ditambahkan.',
            'perumahan' => $perumahan,
        ], 201);
    }

    public function show(Perumahan $perumahan): JsonResponse
    {
        $perumahan->loadCount('warga');

        return response()->json(['perumahan' => $perumahan]);
    }

    public function update(Request $request, Perumahan $perumahan): JsonResponse
    {
        $validated = $request->validate([
            'nama'       => 'sometimes|required|string|max:255',
            'lokasi'     => 'sometimes|required|string|max:255',
            'admin_nama' => 'nullable|string|max:255',
            'telepon'    => 'nullable|string|max:20',
            'email'      => 'nullable|email|max:255',
            'total_unit' => 'nullable|integer|min:0',
            'status'     => 'nullable|in:aktif,nonaktif',
        ]);

        $perumahan->update($validated);

        return response()->json([
            'message'   => 'Perumahan berhasil diperbarui.',
            'perumahan' => $perumahan,
        ]);
    }

    public function destroy(Perumahan $perumahan): JsonResponse
    {
        $perumahan->delete();

        return response()->json(['message' => 'Perumahan berhasil dihapus.']);
    }
}
