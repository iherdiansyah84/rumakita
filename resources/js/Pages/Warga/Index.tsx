import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { WargaModule } from "../../src/app/components/WargaModule";

export type AnggotaKeluarga = {
  id?: number;
  nama: string;
  status_hubungan: "Suami" | "Istri" | "Anak" | "Saudara" | "Single";
  nik: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P" | "";
  pekerjaan: string;
};

export type WargaRow = {
  id: number;
  perumahan_id: number | null;
  perumahan: { id: number; nama: string } | null;
  nama: string;
  nik: string | null;
  blok: string;
  no_hp: string | null;
  email: string | null;
  status_iuran: "lunas" | "pending" | "tunggak";
  status_tinggal: "Tetap" | "Kontrak" | "Pindah" | null;
  alamat_pindah: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: "L" | "P" | null;
  agama: string | null;
  pekerjaan: string | null;
  status_perkawinan: string | null;
  alamat_asal: string | null;
  tipe_dokumen: "KTP" | "Passport" | null;
  no_dokumen: string | null;
  foto_ktp_url: string | null;
  foto_kk_url: string | null;
  anggota_keluarga: AnggotaKeluarga[];
};

type Perumahan = { id: number; nama: string };

type Props = {
  warga: WargaRow[];
  perumahan: Perumahan[];
  stats: { total_kk: number; lunas: number; pending: number; tunggak: number };
};

export default function Warga({ warga, perumahan, stats }: Props) {
  return (
    <AppLayout>
      <Head title="Data Warga - RumaKita" />
      <WargaModule warga={warga} perumahan={perumahan} stats={stats} />
    </AppLayout>
  );
}
