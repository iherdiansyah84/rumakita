import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { PembayaranModule } from "../../src/app/components/PembayaranModule";

type MasterIuranDetail = {
    id: number;
    nama_iuran: string;
    jumlah: number;
};

type MasterIuran = {
    id: number;
    bulan: number;
    tahun: number;
    total_iuran: number;
    details: MasterIuranDetail[];
};

type Tagihan = {
    id: number;
    masterIuran: MasterIuran;
    status: 'belum_lunas' | 'lunas';
    tanggal_bayar: string | null;
};

type Warga = {
    id: number;
    nama: string;
    blok: string;
    tagihans?: Tagihan[];
};

type Bukti = {
    id: number;
    file_path: string;
};

type PembayaranIuran = {
    id: number;
    warga: Warga;
    tanggal: string;
    total: number;
    status: string;
    catatan: string | null;
    buktis: Bukti[];
    tagihans: Tagihan[];
};

type Props = {
    wargas: Warga[];
    pembayarans: PembayaranIuran[];
    isWargaRole: boolean;
    linkedWargaId: number | null;
};

export default function PembayaranPage({ wargas, pembayarans, isWargaRole, linkedWargaId }: Props) {
    return (
        <AppLayout>
            <Head title="Pembayaran Iuran Warga - RumaKita" />
            <PembayaranModule wargas={wargas} pembayarans={pembayarans} isWargaRole={isWargaRole} linkedWargaId={linkedWargaId} />
        </AppLayout>
    );
}
