import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { MarketplaceModule } from "../../src/app/components/MarketplaceModule";

type Produk = {
    id: number; user_id: number; penjual: string;
    judul: string; deskripsi: string | null;
    harga: number; kategori: string; gambar: string | null;
    status: "active" | "sold"; created_at: string;
};

export default function Marketplace({ produk }: { produk: Produk[] }) {
    return (
        <AppLayout>
            <Head title="Marketplace - RumaKita" />
            <MarketplaceModule produk={produk} />
        </AppLayout>
    );
}
