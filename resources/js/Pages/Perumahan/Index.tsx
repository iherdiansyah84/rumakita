import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { PerumahanModule } from "../../src/app/components/PerumahanModule";

type Perumahan = {
    id: number; nama: string; lokasi: string; admin_nama: string;
    telepon: string | null; email: string | null;
    total_unit: number; status: "active" | "inactive"; warga_count: number;
};

export default function Perumahan({ perumahan }: { perumahan: Perumahan[] }) {
    return (
        <AppLayout>
            <Head title="Perumahan - RumaKita" />
            <PerumahanModule perumahan={perumahan} />
        </AppLayout>
    );
}
