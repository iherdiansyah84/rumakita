import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { AgendaModule } from "../../src/app/components/AgendaModule";

type Agenda = {
    id: number; judul: string; tanggal: string;
    waktu_mulai: string | null; waktu_selesai: string | null;
    lokasi: string; tipe: string; penyelenggara: string;
    max_peserta: number | null; status: "upcoming" | "ongoing" | "completed";
};

export default function Agenda({ agenda }: { agenda: Agenda[] }) {
    return (
        <AppLayout>
            <Head title="Agenda - RumaKita" />
            <AgendaModule agenda={agenda} />
        </AppLayout>
    );
}
