<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Agenda::query();

        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%')
                  ->orWhere('lokasi', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal', '<=', $request->tanggal_sampai);
        }

        $agenda = $query->orderBy('tanggal')->paginate($request->get('per_page', 15));

        return response()->json($agenda);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'judul'          => 'required|string|max:255',
            'tanggal'        => 'required|date',
            'waktu_mulai'    => 'nullable|date_format:H:i',
            'waktu_selesai'  => 'nullable|date_format:H:i|after:waktu_mulai',
            'lokasi'         => 'nullable|string|max:255',
            'tipe'           => 'nullable|string|max:50',
            'penyelenggara'  => 'nullable|string|max:255',
            'max_peserta'    => 'nullable|integer|min:0',
            'status'         => 'nullable|in:upcoming,ongoing,selesai,dibatalkan',
        ]);

        $agenda = Agenda::create($validated);

        return response()->json([
            'message' => 'Agenda berhasil ditambahkan.',
            'agenda'  => $agenda,
        ], 201);
    }

    public function show(Agenda $agenda): JsonResponse
    {
        return response()->json(['agenda' => $agenda]);
    }

    public function update(Request $request, Agenda $agenda): JsonResponse
    {
        $validated = $request->validate([
            'judul'          => 'sometimes|required|string|max:255',
            'tanggal'        => 'sometimes|required|date',
            'waktu_mulai'    => 'nullable|date_format:H:i',
            'waktu_selesai'  => 'nullable|date_format:H:i',
            'lokasi'         => 'nullable|string|max:255',
            'tipe'           => 'nullable|string|max:50',
            'penyelenggara'  => 'nullable|string|max:255',
            'max_peserta'    => 'nullable|integer|min:0',
            'status'         => 'nullable|in:upcoming,ongoing,selesai,dibatalkan',
        ]);

        $agenda->update($validated);

        return response()->json([
            'message' => 'Agenda berhasil diperbarui.',
            'agenda'  => $agenda,
        ]);
    }

    public function destroy(Agenda $agenda): JsonResponse
    {
        $agenda->delete();

        return response()->json(['message' => 'Agenda berhasil dihapus.']);
    }
}
