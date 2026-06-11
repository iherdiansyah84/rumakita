<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Agenda;
use App\Models\User;
use App\Notifications\AgendaNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;

class SendAgendaReminders extends Command
{
    protected $signature = 'agenda:send-reminders';
    protected $description = 'Send agenda reminders to participants based on reminder_minutes setting';

    public function handle()
    {
        $now = now();

        $agendas = Agenda::where('status', 'upcoming')
            ->whereNotNull('reminder_minutes')
            ->where('reminder_sent', false)
            ->whereNotNull('peserta_ids')
            ->get();

        foreach ($agendas as $agenda) {
            if (!$agenda->tanggal) continue;

            $waktu_mulai = $agenda->waktu_mulai ?? '00:00';
            $agendaTimeStr = $agenda->tanggal->format('Y-m-d') . ' ' . $waktu_mulai;
            
            try {
                $agendaTime = Carbon::createFromFormat('Y-m-d H:i', $agendaTimeStr);
                $reminderTime = $agendaTime->copy()->subMinutes($agenda->reminder_minutes);

                // If the reminder time has passed and the agenda hasn't started yet
                if ($now->greaterThanOrEqualTo($reminderTime) && $now->lessThan($agendaTime)) {
                    // Send reminder
                    $users = User::whereIn('id', $agenda->peserta_ids)->get();
                    if ($users->isNotEmpty()) {
                        Notification::send($users, new AgendaNotification($agenda, true));
                    }
                    
                    $agenda->update(['reminder_sent' => true]);
                    $this->info("Reminder sent for agenda: {$agenda->judul}");
                }
            } catch (\Exception $e) {
                $this->error("Error processing agenda {$agenda->id}: {$e->getMessage()}");
            }
        }
    }
}
