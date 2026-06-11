<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\PengumumanNotification;
use Illuminate\Http\RedirectResponse;

class NotificationController extends Controller
{
    public function markAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }
    
    public function markOneAsRead(Request $request, $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }
        return back();
    }

    public function sendPengumuman(Request $request): RedirectResponse
    {
        // Bisa dibatasi dengan middleware/gate tertentu. Sementara kita cek apakah ada permission atau role 'Admin'.
        // Jika sistem role sudah ada, bisa diubah. Untuk saat ini kita asumsikan semua warga yang membuka form ini memiliki akses (nanti diatur via Frontend atau Middleware).

        $request->validate([
            'judul' => 'required|string|max:100',
            'pesan' => 'required|string|max:1000'
        ]);

        $users = User::where('perumahan_id', $request->user()->perumahan_id)->get();
        foreach ($users as $user) {
            $user->notify(new PengumumanNotification($request->judul, $request->pesan));
        }

        return back()->with('success', 'Pengumuman berhasil dikirim ke seluruh warga.');
    }
}
