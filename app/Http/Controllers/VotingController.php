<?php

namespace App\Http\Controllers;

use App\Models\Voting;
use App\Models\VotingPilihan;
use App\Models\VotingSuara;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VotingController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Voting/Index', [
            'voting' => Voting::with('pilihan')->latest()->get()
                ->map(fn($v) => [
                    'id'          => $v->id,
                    'judul'       => $v->judul,
                    'deskripsi'   => $v->deskripsi,
                    'deadline'    => $v->deadline?->format('d M Y'),
                    'status'      => $v->status,
                    'total_suara' => $v->pilihan->sum('votes'),
                    'sudah_pilih' => VotingSuara::where('voting_id', $v->id)->where('user_id', $userId)->exists(),
                    'pilihan'     => $v->pilihan->map(fn($p) => [
                        'id'         => $p->id,
                        'nama'       => $p->nama,
                        'votes'      => $p->votes,
                        'percentage' => ($v->pilihan->sum('votes') > 0)
                            ? round($p->votes / $v->pilihan->sum('votes') * 100)
                            : 0,
                    ]),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'      => 'required|string|max:255',
            'deskripsi'  => 'nullable|string',
            'deadline'   => 'nullable|date',
            'pilihan'    => 'required|array|min:2',
            'pilihan.*'  => 'required|string|max:255',
        ]);

        $voting = Voting::create([
            'judul'     => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'deadline'  => $validated['deadline'] ?? null,
            'status'    => 'active',
        ]);

        foreach ($validated['pilihan'] as $nama) {
            $voting->pilihan()->create(['nama' => $nama]);
        }

        return back()->with('success', 'Voting berhasil dibuat.');
    }

    public function update(Request $request, Voting $voting): RedirectResponse
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'deadline'  => 'nullable|date',
            'status'    => 'required|in:active,completed',
        ]);

        $voting->update($validated);

        return back()->with('success', 'Voting berhasil diperbarui.');
    }

    public function destroy(Voting $voting): RedirectResponse
    {
        $voting->delete();

        return back()->with('success', 'Voting berhasil dihapus.');
    }

    public function vote(Request $request, Voting $voting): RedirectResponse
    {
        $request->validate([
            'pilihan_id' => 'required|exists:voting_pilihan,id',
        ]);

        $userId = $request->user()->id;

        if (VotingSuara::where('voting_id', $voting->id)->where('user_id', $userId)->exists()) {
            return back()->withErrors(['pilihan_id' => 'Anda sudah memberikan suara.']);
        }

        VotingSuara::create([
            'voting_id'         => $voting->id,
            'voting_pilihan_id' => $request->pilihan_id,
            'user_id'           => $userId,
        ]);

        VotingPilihan::where('id', $request->pilihan_id)->increment('votes');

        return back()->with('success', 'Suara Anda berhasil dicatat.');
    }
}
