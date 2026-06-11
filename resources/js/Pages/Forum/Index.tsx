import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { ForumModule } from "../../src/app/components/ForumModule";

type Diskusi = {
    id: number; user_id: number; user: string; judul: string;
    konten: string; kategori: string; likes: number;
    komentar_count: number; created_at: string;
};

export default function Forum({ diskusi }: { diskusi: Diskusi[] }) {
    return (
        <AppLayout>
            <Head title="Forum - RumaKita" />
            <ForumModule diskusi={diskusi} />
        </AppLayout>
    );
}
