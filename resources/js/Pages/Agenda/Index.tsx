import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { AgendaModule } from "../../src/app/components/AgendaModule";

type Agenda = {
    id: number;
    judul: string;
    tanggal: string;
    waktu_mulai: string | null;
    waktu_selesai: string | null;
    lokasi: string;
    tipe: string;
    penyelenggara: string;
    peserta_ids: number[] | null;
    reminder_minutes: number | null;
    status: "upcoming" | "ongoing" | "completed";
};
type Warga = { id: number; name: string; };

export default function Agenda({ agenda, warga }: { agenda: Agenda[], warga: Warga[] }) {
    return (
        <AppLayout>
            <Head title="Agenda - RumaKita" />
            <AgendaModule agenda={agenda} wargaList={warga} />
        </AppLayout>
    );
}
