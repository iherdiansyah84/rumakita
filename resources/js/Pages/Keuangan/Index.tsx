import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { KeuanganModule } from "../../src/app/components/KeuanganModule";

type TransaksiDetail = {
    id?: number;
    nama_iuran: string;
    bulan: number;
    tahun: number;
    jumlah: number;
};

type Transaksi = {
    id: number; tanggal: string; deskripsi: string;
    tipe: "in" | "out"; jumlah: number; kategori: string | null;
    warga_id?: number | null;
    warga?: { id: number; nama: string; blok: string } | null;
    details?: TransaksiDetail[];
};

type Warga = {
    id: number;
    nama: string;
    blok: string;
};

type Props = {
    transaksi: Transaksi[];
    wargaList: Warga[];
    stats: { saldo: number; pemasukan: number; pengeluaran: number };
};

export default function Keuangan({ transaksi, wargaList, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Keuangan - RumaKita" />
            <KeuanganModule transaksi={transaksi} wargaList={wargaList} stats={stats} />
        </AppLayout>
    );
}
