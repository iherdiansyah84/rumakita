<?php

namespace App\Http\Controllers;

use App\Models\Marketplace;
use App\Models\PesananMarketplace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class PesananMarketplaceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $pesananMasuk = PesananMarketplace::with(['marketplace', 'pembeli:id,name', 'messages.user:id,name'])
            ->where('penjual_id', $user->id)
            ->latest()
            ->get()
            ->map(fn($p) => $this->formatPesanan($p));

        $pesananSaya = PesananMarketplace::with(['marketplace', 'penjual:id,name', 'messages.user:id,name'])
            ->where('pembeli_id', $user->id)
            ->latest()
            ->get()
            ->map(fn($p) => $this->formatPesanan($p));

        return Inertia::render('Marketplace/Pesanan', [
            'pesananMasuk' => $pesananMasuk,
            'pesananSaya' => $pesananSaya,
        ]);
    }

    public function store(Request $request, Marketplace $marketplace): RedirectResponse
    {
        $request->validate([
            'pesan' => 'nullable|string|max:1000',
        ]);

        if ($marketplace->user_id === $request->user()->id) {
            return back()->withErrors(['pesan' => 'Anda tidak bisa memesan barang Anda sendiri.']);
        }

        if ($marketplace->status === 'sold') {
            return back()->withErrors(['pesan' => 'Barang sudah tidak tersedia.']);
        }

        $existingOrder = PesananMarketplace::where('marketplace_id', $marketplace->id)
            ->where('pembeli_id', $request->user()->id)
            ->whereIn('status', ['menunggu', 'diproses'])
            ->first();

        if ($existingOrder) {
            return back()->withErrors(['pesan' => 'Anda sudah memiliki pesanan aktif (menunggu/diproses) untuk barang ini.']);
        }

        PesananMarketplace::create([
            'perumahan_id' => $marketplace->perumahan_id,
            'marketplace_id' => $marketplace->id,
            'pembeli_id' => $request->user()->id,
            'penjual_id' => $marketplace->user_id,
            'pesan' => $request->pesan,
            'status' => 'menunggu',
        ]);

        $marketplace->user->notify(new \App\Notifications\MarketplaceNotification(
            "Pesanan baru masuk untuk barang Anda: " . $marketplace->judul
        ));

        return redirect()->route('marketplace.pesanan')->with('success', 'Pesanan berhasil diajukan.');
    }

    public function update(Request $request, PesananMarketplace $pesanan): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:diproses,ditolak,selesai,dibatalkan'
        ]);

        $user = $request->user();
        $newStatus = $request->status;

        if ($user->id === $pesanan->penjual_id) {
            if (!in_array($newStatus, ['diproses', 'ditolak', 'selesai'])) {
                abort(403);
            }
            $pesanan->pembeli->notify(new \App\Notifications\MarketplaceNotification(
                "Pesanan Anda untuk " . $pesanan->marketplace->judul . " telah diubah menjadi: " . strtoupper($newStatus)
            ));
        } elseif ($user->id === $pesanan->pembeli_id) {
            if (!in_array($newStatus, ['dibatalkan', 'selesai'])) {
                abort(403);
            }
            if ($newStatus === 'dibatalkan') {
                $pesanan->penjual->notify(new \App\Notifications\MarketplaceNotification(
                    "Pesanan untuk " . $pesanan->marketplace->judul . " telah DIBATALKAN oleh Pembeli."
                ));
            }
        } else {
            abort(403);
        }

        $pesanan->update(['status' => $newStatus]);

        if ($newStatus === 'selesai') {
            $pesanan->marketplace->update(['status' => 'sold']);
            PesananMarketplace::where('marketplace_id', $pesanan->marketplace_id)
                ->where('id', '!=', $pesanan->id)
                ->whereIn('status', ['menunggu', 'diproses'])
                ->update(['status' => 'dibatalkan']);
        }

        return back()->with('success', 'Status pesanan diperbarui.');
    }

    private function formatPesanan(PesananMarketplace $p)
    {
        $gambar = is_array($p->marketplace->gambar) ? array_map(fn($g) => Storage::url($g), $p->marketplace->gambar) : [];
        $userId = auth()->id();

        return [
            'id' => $p->id,
            'marketplace_id' => $p->marketplace_id,
            'marketplace_judul' => $p->marketplace->judul,
            'marketplace_gambar' => $gambar[0] ?? null,
            'marketplace_harga' => $p->marketplace->harga,
            'marketplace_tipe' => $p->marketplace->tipe_iklan,
            'pembeli' => $p->pembeli->name ?? null,
            'penjual' => $p->penjual->name ?? null,
            'pesan' => $p->pesan,
            'status' => $p->status,
            'has_unread_messages' => $p->messages->where('user_id', '!=', $userId)->where('is_read', false)->isNotEmpty(),
            'created_at' => $p->created_at,
            'messages' => $p->messages->map(fn($m) => [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'pengirim' => $m->user->name,
                'pesan' => $m->pesan,
                'created_at' => $m->created_at,
            ]),
        ];
    }

    public function chat(Request $request, PesananMarketplace $pesanan): RedirectResponse
    {
        $request->validate(['pesan' => 'required|string|max:1000']);
        
        $user = $request->user();
        if ($user->id !== $pesanan->pembeli_id && $user->id !== $pesanan->penjual_id) {
            abort(403);
        }

        $pesanan->messages()->create([
            'user_id' => $user->id,
            'pesan' => $request->pesan,
        ]);

        $otherParty = $user->id === $pesanan->pembeli_id ? $pesanan->penjual : $pesanan->pembeli;
        $otherParty->notify(new \App\Notifications\MarketplaceNotification(
            "Pesan baru dari " . $user->name . " di pesanan: " . $pesanan->marketplace->judul
        ));

        return back();
    }

    public function readChat(Request $request, PesananMarketplace $pesanan): RedirectResponse
    {
        $user = $request->user();
        if ($user->id !== $pesanan->pembeli_id && $user->id !== $pesanan->penjual_id) {
            abort(403);
        }

        $pesanan->messages()->where('user_id', '!=', $user->id)->update(['is_read' => true]);

        return back();
    }
}
