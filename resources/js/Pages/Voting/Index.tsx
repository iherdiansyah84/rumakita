import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { VotingModule } from "../../src/app/components/VotingModule";

type VotingItem = {
    id: number; judul: string; deskripsi: string | null;
    deadline: string | null; status: "active" | "completed";
    total_suara: number; sudah_pilih: boolean;
    pilihan: { id: number; nama: string; votes: number; percentage: number }[];
};

export default function Voting({ voting }: { voting: VotingItem[] }) {
    return (
        <AppLayout>
            <Head title="Voting - RumaKita" />
            <VotingModule voting={voting} />
        </AppLayout>
    );
}
