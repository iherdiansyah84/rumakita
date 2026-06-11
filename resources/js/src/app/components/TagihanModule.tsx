import { useState } from "react";
import { router } from "@inertiajs/react";
import { Plus, Trash2, X, Users, CheckCircle, Clock } from "lucide-react";

type MasterIuranDetail = {
    id?: number;
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

const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function formatRp(val: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

export function TagihanModule({ masterIurans }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState<MasterIuran | null>(null);

    const [form, setForm] = useState({
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear(),
        details: [
            { nama_iuran: "Iuran Kebersihan", jumlah: 20000 },
            { nama_iuran: "Iuran Keamanan", jumlah: 30000 }
        ] as MasterIuranDetail[]
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        router.post("/tagihan/master", form, {
            onSuccess: () => setShowCreateModal(false)
        });
    }

    function openCreateModal(masterToCopy?: MasterIuran) {
        if (masterToCopy) {
            let nextMonth = masterToCopy.bulan + 1;
            let nextYear = masterToCopy.tahun;
            if (nextMonth > 12) {
                nextMonth = 1;
                nextYear += 1;
            }
            setForm({
                bulan: nextMonth,
                tahun: nextYear,
                details: masterToCopy.details.map(d => ({ nama_iuran: d.nama_iuran, jumlah: d.jumlah }))
            });
        } else {
            setForm({
                bulan: new Date().getMonth() + 1,
                tahun: new Date().getFullYear(),
                details: [
                    { nama_iuran: "Iuran Kebersihan", jumlah: 20000 },
                    { nama_iuran: "Iuran Keamanan", jumlah: 30000 }
                ]
            });
        }
        setShowCreateModal(true);
    }

    function addDetail() {
        setForm({ ...form, details: [...form.details, { nama_iuran: "", jumlah: 0 }] });
    }

    function removeDetail(i: number) {
        setForm({ ...form, details: form.details.filter((_, idx) => idx !== i) });
    }

    function updateDetail(i: number, key: keyof MasterIuranDetail, val: string | number) {
        const newDetails = [...form.details];
        newDetails[i] = { ...newDetails[i], [key]: val };
        setForm({ ...form, details: newDetails });
    }

    function generateTagihan(id: number) {
        if(confirm("Generate tagihan untuk seluruh warga aktif di bulan ini?")) {
            router.post(`/tagihan/master/${id}/generate`);
        }
    }

    function bayarTagihan(tagihanId: number) {
        if(confirm("Tandai tagihan ini sebagai Lunas? Dana akan langsung masuk ke Kas Pemasukan.")) {
            router.post(`/tagihan/${tagihanId}/bayar`);
        }
    }

    function deleteMaster(id: number) {
        if(confirm("Hapus draft tagihan ini? (Semua tagihan yang ter-generate akan terhapus jika ada)")) {
            router.delete(`/tagihan/master/${id}`);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-2">Tagihan Bulanan</h1>
                    <p className="text-muted-foreground">Buat dan kelola tagihan massal untuk warga</p>
                </div>
                <button
                    onClick={() => openCreateModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Buat Draft Iuran
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {masterIurans.length === 0 ? (
                    <div className="bg-card rounded-xl p-10 text-center border border-border">
                        <p className="text-muted-foreground">Belum ada tagihan bulanan. Buat draft terlebih dahulu.</p>
                    </div>
                ) : (
                    masterIurans.map((master) => {
                        const totalWarga = master.tagihans.length;
                        const lunasCount = master.tagihans.filter(t => t.status === 'lunas').length;

                        return (
                            <div key={master.id} className="bg-card rounded-xl border border-border overflow-hidden">
                                <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">Iuran {MONTHS[master.bulan - 1]} {master.tahun}</h2>
                                        <p className="text-sm text-muted-foreground">Total: <span className="font-semibold text-primary">{formatRp(master.total_iuran)}</span> / warga</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedMaster(selectedMaster?.id === master.id ? null : master)} className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm hover:bg-muted">
                                            {selectedMaster?.id === master.id ? "Tutup Detail" : "Lihat Tagihan Warga"}
                                        </button>
                                        <button onClick={() => openCreateModal(master)} className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm hover:bg-blue-100">
                                            Salin
                                        </button>
                                        <button onClick={() => deleteMaster(master.id)} className="px-3 py-1.5 text-destructive bg-destructive/10 rounded-lg text-sm hover:bg-destructive/20">
                                            Hapus Draft
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5 flex gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold mb-3">Rincian Iuran</h3>
                                        <ul className="space-y-2 text-sm">
                                            {master.details.map((d, i) => (
                                                <li key={i} className="flex justify-between p-2 bg-muted/50 rounded-lg">
                                                    <span>{d.nama_iuran}</span>
                                                    <span className="font-medium">{formatRp(d.jumlah)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex-1 border-l border-border pl-8 flex flex-col justify-center">
                                        {totalWarga === 0 ? (
                                            <div className="text-center">
                                                <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground mb-3">Belum ditagihkan ke warga</p>
                                                <button onClick={() => generateTagihan(master.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                                    Generate ke Warga
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-sm font-semibold mb-3">Status Pembayaran</h3>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                        <div className="bg-primary h-full" style={{ width: `${(lunasCount/totalWarga)*100}%` }}></div>
                                                    </div>
                                                    <span className="text-sm font-semibold">{lunasCount} / {totalWarga} Lunas</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedMaster?.id === master.id && totalWarga > 0 && (
                                    <div className="border-t border-border bg-background">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-muted text-muted-foreground">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Nama Warga</th>
                                                        <th className="px-4 py-3 font-medium">Blok</th>
                                                        <th className="px-4 py-3 font-medium">Status</th>
                                                        <th className="px-4 py-3 font-medium">Tgl Bayar</th>
                                                        <th className="px-4 py-3 font-medium">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {master.tagihans.map(t => (
                                                        <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                                                            <td className="px-4 py-3 font-medium">{t.warga.nama}</td>
                                                            <td className="px-4 py-3">{t.warga.blok}</td>
                                                            <td className="px-4 py-3">
                                                                {t.status === 'lunas' ? (
                                                                    <span className="inline-flex items-center gap-1 text-teal-600 bg-teal-100 px-2 py-1 rounded-md text-xs font-medium">
                                                                        <CheckCircle className="w-3.5 h-3.5" /> Lunas
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-md text-xs font-medium">
                                                                        <Clock className="w-3.5 h-3.5" /> Belum Lunas
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">{t.tanggal_bayar ? new Date(t.tanggal_bayar).toLocaleDateString("id-ID") : "-"}</td>
                                                            <td className="px-4 py-3">
                                                                {t.status !== 'lunas' && (
                                                                    <button onClick={() => bayarTagihan(t.id)} className="text-primary hover:underline text-xs font-medium">
                                                                        Bayar & Lunas
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border w-full max-w-lg">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h2 className="text-lg font-semibold">Buat Draft Tagihan Iuran</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Bulan *</label>
                                    <select
                                        value={form.bulan}
                                        onChange={(e) => setForm({ ...form, bulan: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tahun *</label>
                                    <input
                                        type="number"
                                        value={form.tahun}
                                        onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium">Rincian Biaya per Warga *</label>
                                    <button type="button" onClick={addDetail} className="text-xs text-primary hover:underline">
                                        + Tambah Baris
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {form.details.map((d, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input
                                                value={d.nama_iuran}
                                                onChange={(e) => updateDetail(i, 'nama_iuran', e.target.value)}
                                                placeholder="Nama Iuran (mis: Kebersihan)"
                                                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                required
                                            />
                                            <input
                                                type="number"
                                                value={d.jumlah}
                                                onChange={(e) => updateDetail(i, 'jumlah', Number(e.target.value))}
                                                placeholder="Rp"
                                                className="w-32 px-3 py-1.5 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                required
                                            />
                                            <button type="button" onClick={() => removeDetail(i)} className="p-1.5 text-muted-foreground hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg text-sm mt-3">
                                        <span className="font-semibold">Total Tagihan:</span>
                                        <span className="font-semibold text-primary">{formatRp(form.details.reduce((s,d)=>s+d.jumlah,0))}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                    Simpan Draft
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
