<?php

namespace App\Http\Controllers;

use App\Models\Diskusi;
use App\Models\KomentarDiskusi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DiskusiController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $diskusi = Diskusi::with(['user:id,name', 'komentar.user:id,name', 'reactions', 'komentar.reactions'])->latest()->get();

        $diskusiFormatted = $diskusi->map(function ($d) use ($userId) {
            $comments = $d->komentar->map(fn($k) => [
                'id' => $k->id,
                'parent_id' => $k->parent_id,
                'user_id' => $k->user_id,
                'user' => $k->user->name ?? 'Anonim',
                'konten' => $k->konten,
                'created_at' => $k->created_at,
                'reactions' => $this->formatReactions($k->reactions, $userId),
            ])->toArray();

            $commentTree = $this->buildCommentTree($comments);

            $lampiranUrls = [];
            if (!empty($d->lampiran) && is_array($d->lampiran)) {
                foreach ($d->lampiran as $path) {
                    $lampiranUrls[] = asset('storage/' . $path);
                }
            }

            return [
                'id'            => $d->id,
                'user_id'       => $d->user_id,
                'user'          => $d->user->name ?? 'Anonim',
                'judul'         => $d->judul,
                'konten'        => $d->konten,
                'kategori'      => $d->kategori,
                'status'        => $d->status,
                'lampiran'      => $lampiranUrls,
                'reactions'     => $this->formatReactions($d->reactions, $userId),
                'komentar'      => $commentTree,
                'komentar_count'=> count($comments),
                'created_at'    => $d->created_at,
            ];
        });

        return Inertia::render('Forum/Index', [
            'diskusi' => $diskusiFormatted
        ]);
    }

    private function buildCommentTree(array $elements, $parentId = null) {
        $branch = [];
        foreach ($elements as $element) {
            if ($element['parent_id'] == $parentId) {
                $children = $this->buildCommentTree($elements, $element['id']);
                $element['replies'] = $children;
                $branch[] = $element;
            }
        }
        return $branch;
    }

    private function formatReactions($reactions, $userId)
    {
        $counts = $reactions->groupBy('type')->map->count();
        $userReaction = $reactions->firstWhere('user_id', $userId);
        return [
            'counts' => $counts,
            'user_reaction' => $userReaction ? $userReaction->type : null,
            'total' => $reactions->count(),
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'      => 'required|string|max:255',
            'konten'     => 'required|string',
            'kategori'   => 'required|string|max:100',
            'lampiran.*' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov|max:20480',
        ]);

        $lampiranPaths = [];
        if ($request->hasFile('lampiran')) {
            foreach ($request->file('lampiran') as $file) {
                $lampiranPaths[] = $file->store('forum/lampiran', 'public');
            }
        }

        $validated['user_id'] = $request->user()->id;
        $validated['lampiran'] = empty($lampiranPaths) ? null : $lampiranPaths;

        Diskusi::create($validated);

        return back()->with('success', 'Diskusi berhasil dibuat.');
    }

    public function update(Request $request, Diskusi $diskusi): RedirectResponse
    {
        Gate::authorize('update', $diskusi);

        $validated = $request->validate([
            'judul'      => 'required|string|max:255',
            'konten'     => 'required|string',
            'kategori'   => 'required|string|max:100',
            'lampiran.*' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov|max:20480',
        ]);

        if ($request->hasFile('lampiran')) {
            // Delete old files
            if (!empty($diskusi->lampiran) && is_array($diskusi->lampiran)) {
                foreach ($diskusi->lampiran as $oldPath) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $lampiranPaths = [];
            foreach ($request->file('lampiran') as $file) {
                $lampiranPaths[] = $file->store('forum/lampiran', 'public');
            }
            $validated['lampiran'] = $lampiranPaths;
        }

        $diskusi->update($validated);

        return back()->with('success', 'Diskusi berhasil diperbarui.');
    }

    public function destroy(Diskusi $diskusi): RedirectResponse
    {
        Gate::authorize('delete', $diskusi);

        if (!empty($diskusi->lampiran) && is_array($diskusi->lampiran)) {
            foreach ($diskusi->lampiran as $oldPath) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $diskusi->delete();

        return back()->with('success', 'Diskusi berhasil dihapus.');
    }

    public function toggleStatus(Request $request, Diskusi $diskusi): RedirectResponse
    {
        if ($request->user()->id !== $diskusi->user_id && !$request->user()->hasRole(['pengurus', 'super_admin'])) {
            abort(403);
        }

        $diskusi->update([
            'status' => $diskusi->status === 'open' ? 'closed' : 'open'
        ]);

        return back()->with('success', 'Status diskusi berhasil diubah.');
    }

    public function toggleReaction(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'reactionable_type' => 'required|in:diskusi,komentar',
            'reactionable_id' => 'required|integer',
        ]);

        $modelClass = $validated['reactionable_type'] === 'diskusi' ? Diskusi::class : KomentarDiskusi::class;
        $model = $modelClass::findOrFail($validated['reactionable_id']);

        $existing = $model->reactions()->where('user_id', $request->user()->id)->first();
        if ($existing) {
            if ($existing->type === $validated['type']) {
                $existing->delete();
            } else {
                $existing->update(['type' => $validated['type']]);
            }
        } else {
            $model->reactions()->create([
                'user_id' => $request->user()->id,
                'type' => $validated['type']
            ]);
        }

        return back();
    }

    public function storeKomentar(Request $request, Diskusi $diskusi): RedirectResponse
    {
        if ($diskusi->status === 'closed') {
            return back()->with('error', 'Diskusi ini telah ditutup.');
        }

        $validated = $request->validate([
            'konten'    => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:komentar_diskusi,id',
        ]);

        KomentarDiskusi::create([
            'diskusi_id' => $diskusi->id,
            'user_id'    => $request->user()->id,
            'konten'     => $validated['konten'],
            'parent_id'  => $validated['parent_id'] ?? null,
        ]);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }
}
