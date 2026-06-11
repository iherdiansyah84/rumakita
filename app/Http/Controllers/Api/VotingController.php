<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voting;
use App\Models\VotingPilihan;
use App\Models\VotingSuara;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VotingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Voting::withCount('suara');

        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $voting = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($voting);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'deadline'  => 'nullable|date',
            'status'    => 'nullable|in:aktif,selesai,draft',
            'pilihan'   => 'required|array|min:2',
            'pilihan.*' => 'required|string|max:255',
        ]);

        $voting = Voting::create([
            'judul'     => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'deadline'  => $validated['deadline'] ?? null,
            'status'    => $validated['status'] ?? 'aktif',
        ]);

        foreach ($validated['pilihan'] as $namaPilihan) {
            $voting->pilihan()->create(['nama' => $namaPilihan, 'votes' => 0]);
        }

        $voting->load('pilihan');

        return response()->json([
            'message' => 'Voting berhasil dibuat.',
            'voting'  => $voting,
        ], 201);
    }

    public function show(Voting $voting): JsonResponse
    {
        $voting->load('pilihan');
        $voting->loadCount('suara');

        return response()->json(['voting' => $voting]);
    }

    public function update(Request $request, Voting $voting): JsonResponse
    {
        $validated = $request->validate([
            'judul'     => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'deadline'  => 'nullable|date',
            'status'    => 'nullable|in:aktif,selesai,draft',
        ]);

        $voting->update($validated);

        return response()->json([
            'message' => 'Voting berhasil diperbarui.',
            'voting'  => $voting->load('pilihan'),
        ]);
    }

    public function destroy(Voting $voting): JsonResponse
    {
        $voting->delete();

        return response()->json(['message' => 'Voting berhasil dihapus.']);
    }

    public function vote(Request $request, Voting $voting): JsonResponse
    {
        abort_if($voting->status !== 'aktif', 422, 'Voting sudah tidak aktif.');

        $request->validate([
            'pilihan_id' => 'required|exists:voting_pilihan,id',
        ]);

        $pilihan = VotingPilihan::findOrFail($request->pilihan_id);

        abort_if($pilihan->voting_id !== $voting->id, 422, 'Pilihan tidak valid.');

        $sudahVote = VotingSuara::where('voting_id', $voting->id)
            ->where('user_id', $request->user()->id)
            ->exists();

        abort_if($sudahVote, 422, 'Anda sudah memberikan suara pada voting ini.');

        VotingSuara::create([
            'voting_id'   => $voting->id,
            'user_id'     => $request->user()->id,
            'pilihan_id'  => $pilihan->id,
        ]);

        $pilihan->increment('votes');

        return response()->json([
            'message' => 'Suara berhasil diberikan.',
            'pilihan' => $pilihan->fresh(),
        ]);
    }

    public function storePilihan(Request $request, Voting $voting): JsonResponse
    {
        $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $pilihan = $voting->pilihan()->create([
            'nama'  => $request->nama,
            'votes' => 0,
        ]);

        return response()->json([
            'message' => 'Pilihan berhasil ditambahkan.',
            'pilihan' => $pilihan,
        ], 201);
    }

    public function destroyPilihan(Voting $voting, VotingPilihan $pilihan): JsonResponse
    {
        abort_if($pilihan->voting_id !== $voting->id, 404);

        $pilihan->delete();

        return response()->json(['message' => 'Pilihan berhasil dihapus.']);
    }
}
