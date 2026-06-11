import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { GaleriModule } from "../../src/app/components/GaleriModule";

type GaleriItem = {
    id: number; user_id: number; uploader: string;
    judul: string; tanggal_kegiatan: string; kategori: string;
    foto: { id: number; url: string }[]; created_at: string;
};

export default function Galeri({ galeri }: { galeri: GaleriItem[] }) {
    return (
        <AppLayout>
            <Head title="Galeri - RumaKita" />
            <GaleriModule galeri={galeri} />
        </AppLayout>
    );
}
