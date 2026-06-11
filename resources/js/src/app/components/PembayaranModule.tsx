import { useState } from "react";
import { router } from "@inertiajs/react";
import { Search, Image as ImageIcon, Trash2, X, Plus, FileText, CheckCircle } from "lucide-react";

type Warga = {
    id: number;
    nama: string;
    blok: string;
    tagihans?: any[];
};

type PembayaranIuran = {
    id: number;
    warga: Warga;
    tanggal: string;
    total: number;
    status: string;
    catatan: string | null;
    buktis: any[];
    tagihans: any[];
};

type Props = {
    wargas: Warga[];
    pembayarans: PembayaranIuran[];
    isWargaRole: boolean;
    linkedWargaId: number | null;
};

const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function formatRp(val: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

export function PembayaranModule({ wargas, pembayarans, isWargaRole, linkedWargaId }: Props) {
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [selectedWargaId, setSelectedWargaId] = useState<number | "">(isWargaRole && linkedWargaId ? linkedWargaId : "");
    const [selectedTagihans, setSelectedTagihans] = useState<number[]>([]);
    const [catatan, setCatatan] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    
    // Modal for viewing buktis
    const [selectedPembayaran, setSelectedPembayaran] = useState<PembayaranIuran | null>(null);

    const activeWarga = wargas.find(w => w.id === selectedWargaId);
    const totalBayar = activeWarga?.tagihans
        ?.filter(t => selectedTagihans.includes(t.id))
        .reduce((sum, t) => sum + Number(t.master_iuran.total_iuran), 0) || 0;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);
            
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setFilePreviews([...filePreviews, ...newPreviews]);
        }
    }

    function removeFile(index: number) {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
        
        const newPreviews = [...filePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setFilePreviews(newPreviews);
    }

    function toggleTagihan(id: number) {
        if (selectedTagihans.includes(id)) {
            setSelectedTagihans(selectedTagihans.filter(t => t !== id));
        } else {
            setSelectedTagihans([...selectedTagihans, id]);
        }
    }

    function toggleAllTagihan() {
        if (!activeWarga) return;
        if (selectedTagihans.length === activeWarga.tagihans?.length) {
            setSelectedTagihans([]);
        } else {
            setSelectedTagihans(activeWarga.tagihans?.map(t => t.id) || []);
        }
    }

    function resetForm() {
        if (!isWargaRole) {
            setSelectedWargaId("");
        }
        setSelectedTagihans([]);
        setCatatan("");
        setFiles([]);
        setFilePreviews([]);
        setShowForm(false);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (selectedTagihans.length === 0) {
            alert("Pilih minimal 1 tagihan untuk dibayar.");
            return;
        }

        const formData = new FormData();
        formData.append("warga_id", String(selectedWargaId));
        formData.append("catatan", catatan);
        
        selectedTagihans.forEach(id => {
            formData.append("tagihan_ids[]", String(id));
        });

        files.forEach(file => {
            formData.append("buktis[]", file);
        });

        router.post("/pembayaran-iuran", formData, {
            onSuccess: () => resetForm(),
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-2">Pembayaran Iuran Warga</h1>
                    <p className="text-muted-foreground">Catat pembayaran iuran dan unggah bukti transfer</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Catat Pembayaran
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Form Pencatatan Pembayaran</h2>
                        <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Kiri: Pilihan Warga dan Tagihan */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Pilih Warga</label>
                                    <select
                                        value={selectedWargaId}
                                        onChange={(e) => {
                                            setSelectedWargaId(Number(e.target.value));
                                            setSelectedTagihans([]);
                                        }}
                                        className={`w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring ${isWargaRole ? 'opacity-70 cursor-not-allowed bg-muted' : ''}`}
                                        required
                                        disabled={isWargaRole}
                                    >
                                        <option value="">-- Cari atau Pilih Warga --</option>
                                        {wargas.map(w => (
                                            <option key={w.id} value={w.id}>
                                                {w.nama} (Blok {w.blok}) {w.tagihans && w.tagihans.length > 0 ? `(${w.tagihans.length} Tagihan Menunggak)` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {activeWarga && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-medium">Tagihan Belum Lunas ({activeWarga.tagihans?.length || 0})</label>
                                            {activeWarga.tagihans && activeWarga.tagihans.length > 0 && (
                                                <button type="button" onClick={toggleAllTagihan} className="text-xs text-primary hover:underline">
                                                    Pilih Semua
                                                </button>
                                            )}
                                        </div>
                                        
                                        {activeWarga.tagihans && activeWarga.tagihans.length === 0 ? (
                                            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Warga ini tidak memiliki tunggakan iuran.
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                {activeWarga.tagihans?.map((t) => (
                                                    <label key={t.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedTagihans.includes(t.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTagihans.includes(t.id)}
                                                                onChange={() => toggleTagihan(t.id)}
                                                                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                                                            />
                                                            <div>
                                                                <p className="text-sm font-medium">Iuran {MONTHS[t.master_iuran.bulan - 1]} {t.master_iuran.tahun}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-semibold">{formatRp(t.master_iuran.total_iuran)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Kanan: File Bukti, Catatan, Ringkasan */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unggah Bukti Pembayaran (Bisa &gt; 1)</label>
                                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-sm font-medium text-foreground mb-1">Klik atau seret file ke sini</p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG, atau PDF (Maks. 2MB/file)</p>
                                    </div>

                                    {filePreviews.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {filePreviews.map((preview, idx) => (
                                                <div key={idx} className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-muted flex items-center justify-center">
                                                    {files[idx].type.startsWith("image/") ? (
                                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileText className="w-8 h-8 text-muted-foreground" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); removeFile(idx); }}
                                                            className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Catatan Tambahan (Opsional)</label>
                                    <textarea
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Misalnya: Pembayaran via transfer Bank BCA an. Budi..."
                                    />
                                </div>

                                <div className="p-5 bg-primary/5 rounded-xl border border-primary/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Total Pembayaran ({selectedTagihans.length} Tagihan)</span>
                                    </div>
                                    <p className="text-2xl font-bold text-primary">{formatRp(totalBayar)}</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg border border-border hover:bg-muted font-medium transition-colors">
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={selectedTagihans.length === 0}
                                        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Simpan Pembayaran
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-5 border-b border-border bg-muted/30">
                        <h2 className="text-lg font-semibold">Riwayat Pembayaran</h2>
                    </div>
                    {pembayarans.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-muted-foreground">Belum ada riwayat pembayaran.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground border-b border-border">
                                    <tr>
                                        <th className="px-5 py-4 font-medium">Tanggal</th>
                                        <th className="px-5 py-4 font-medium">Nama Warga</th>
                                        <th className="px-5 py-4 font-medium">Blok</th>
                                        <th className="px-5 py-4 font-medium">Total Tagihan</th>
                                        <th className="px-5 py-4 font-medium">Status</th>
                                        <th className="px-5 py-4 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pembayarans.map((p) => (
                                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="px-5 py-4">{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                                            <td className="px-5 py-4 font-medium">{p.warga.nama}</td>
                                            <td className="px-5 py-4">{p.warga.blok}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-primary">{formatRp(p.total)}</span>
                                                    <span className="text-xs text-muted-foreground">{p.tagihans?.length || 0} bln iuran</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                    Lunas
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button onClick={() => setSelectedPembayaran(p)} className="text-primary hover:underline font-medium text-sm">
                                                    Lihat Detail & Bukti
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {selectedPembayaran && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
                            <div>
                                <h2 className="text-xl font-bold">Detail Pembayaran</h2>
                                <p className="text-sm text-muted-foreground">{new Date(selectedPembayaran.tanggal).toLocaleDateString('id-ID')} - {selectedPembayaran.warga.nama}</p>
                            </div>
                            <button onClick={() => setSelectedPembayaran(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Total Pembayaran</p>
                                    <p className="text-xl font-bold text-primary">{formatRp(selectedPembayaran.total)}</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                                    <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-100 px-2.5 py-0.5 mt-1 rounded-md text-sm font-semibold">
                                        Lunas
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" /> Rincian Tagihan yang Dibayar ({selectedPembayaran.tagihans.length})
                                </h3>
                                <ul className="space-y-2 border border-border rounded-lg overflow-hidden">
                                    {selectedPembayaran.tagihans.map((t, i) => (
                                        <li key={i} className="flex justify-between p-3 bg-card border-b border-border last:border-0 text-sm">
                                            <span>Iuran {MONTHS[t.master_iuran.bulan - 1]} {t.master_iuran.tahun}</span>
                                            <span className="font-semibold">{formatRp(t.master_iuran.total_iuran)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {selectedPembayaran.catatan && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold mb-2">Catatan</h3>
                                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border border-border">{selectedPembayaran.catatan}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-primary" /> Bukti Pembayaran ({selectedPembayaran.buktis.length})
                                </h3>
                                {selectedPembayaran.buktis.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">Tidak ada bukti pembayaran yang diunggah.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {selectedPembayaran.buktis.map((b) => (
                                            <a 
                                                key={b.id} 
                                                href={`/storage/${b.file_path}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="block group rounded-lg overflow-hidden border border-border aspect-square bg-muted relative"
                                            >
                                                {b.file_path.endsWith('.pdf') ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                        <FileText className="w-8 h-8 mb-2" />
                                                        <span className="text-xs font-medium">Buka PDF</span>
                                                    </div>
                                                ) : (
                                                    <img src={`/storage/${b.file_path}`} alt="Bukti" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
