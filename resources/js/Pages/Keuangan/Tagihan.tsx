import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { TagihanModule } from "../../src/app/components/TagihanModule";

type MasterIuranDetail = {
    id: number;
    nama_iuran: string;
    jumlah: number;
};

type Warga = {
    id: number;
    nama: string;
    blok: string;
};

type Tagihan = {
    id: number;
    warga: Warga;
    status: 'belum_lunas' | 'lunas';
    tanggal_bayar: string | null;
};

type MasterIuran = {
    id: number;
    bulan: number;
    tahun: number;
    total_iuran: number;
    details: MasterIuranDetail[];
    tagihans: Tagihan[];
};

type Props = {
    masterIurans: MasterIuran[];
};

export default function TagihanPage({ masterIurans }: Props) {
    return (
        <AppLayout>
            <Head title="Tagihan Warga - RumaKita" />
            <TagihanModule masterIurans={masterIurans} />
        </AppLayout>
    );
}
