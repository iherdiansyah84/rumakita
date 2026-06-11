<?php

namespace App\Notifications;

use App\Models\Agenda;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AgendaNotification extends Notification
{
    use Queueable;

    public function __construct(public Agenda $agenda, public bool $isReminder = false)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $judul = $this->isReminder ? "Pengingat Acara: {$this->agenda->judul}" : "Undangan Agenda: {$this->agenda->judul}";
        $waktu = "{$this->agenda->tanggal->format('d/m/Y')}" . ($this->agenda->waktu_mulai ? " pukul {$this->agenda->waktu_mulai}" : "");
        $pesan = $this->isReminder 
            ? "Acara akan segera dimulai pada $waktu di {$this->agenda->lokasi}."
            : "Anda diundang ke acara ini yang akan dilaksanakan pada $waktu di {$this->agenda->lokasi}.";

        return [
            'tipe'  => 'agenda',
            'judul' => $judul,
            'pesan' => $pesan,
            'waktu' => now()->toDateTimeString(),
        ];
    }
}
