import { useState } from "react";
import { router } from "@inertiajs/react";
import { FileText, Plus, Clock, CheckCircle2, XCircle, FileSignature, X, Printer, Pencil } from "lucide-react";
import { useAuth } from "../../../hooks/useRole";

type Surat = {
  id: number;
  user_id: number;
  user: {
      id: number;
      name: string;
      blok_rumah?: string;
      nomor_rumah?: string;
  };
  warga?: {
      id: number;
      nama: string;
      blok?: string;
  };
  anggota_keluarga?: {
      id: number;
      nama: string;
  };
  jenis_surat: string;
  keperluan: string;
  keterangan_tambahan: string | null;
  dokumen_pendukung: string | null;
  status: "pending" | "diproses" | "selesai" | "ditolak";
  catatan_admin: string | null;
  nomor_surat: string | null;
  created_at: string;
};

type AnggotaKeluarga = {
  id: number;
  nama: string;
};

type Warga = {
  id: number;
  nama: string;
  anggota_keluarga?: AnggotaKeluarga[];
};

type Props = {
  suratList: Surat[];
  pilihanWarga?: Warga[];
};

const JENIS_SURAT_OPTIONS = [
  "Surat Pengantar RT/RW",
  "Surat Keterangan Domisili",
  "Surat Keterangan Tidak Mampu",
  "Surat Pengantar Nikah",
  "Surat Keterangan Kematian",
  "Surat Keterangan Pindah",
  "Lainnya"
];

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  diproses: "bg-blue-100 text-blue-700",
  selesai: "bg-green-100 text-green-700",
  ditolak: "bg-red-100 text-red-700",
};

const statusIcon = {
  pending: <Clock className="w-4 h-4" />,
  diproses: <FileSignature className="w-4 h-4" />,
  selesai: <CheckCircle2 className="w-4 h-4" />,
  ditolak: <XCircle className="w-4 h-4" />,
};

const emptyForm = {
  warga_id: null as number | null,
  anggota_keluarga_id: null as number | null,
  jenis_surat: JENIS_SURAT_OPTIONS[0],
  keperluan: "",
  keterangan_tambahan: "",
};

export function SuratModule({ suratList = [], pilihanWarga = [] }: Props) {
  const { roleName, can } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [adminForm, setAdminForm] = useState<{ id: number; status: string; nomor_surat: string; catatan_admin: string }>({
    id: 0, status: "pending", nomor_surat: "", catatan_admin: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.post("/surat", form, {
      onSuccess: () => {
        setShowCreateModal(false);
        setForm(emptyForm);
      },
      onError: (err) => setErrors(err as Record<string, string>),
    });
  }

  function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.patch(`/surat/${adminForm.id}`, {
        status: adminForm.status,
        nomor_surat: adminForm.nomor_surat,
        catatan_admin: adminForm.catatan_admin
    }, {
      onSuccess: () => setShowAdminModal(false),
      onError: (err) => setErrors(err as Record<string, string>),
    });
  }

  function openAdminModal(s: Surat) {
      setAdminForm({
          id: s.id,
          status: s.status,
          nomor_surat: s.nomor_surat || "",
          catatan_admin: s.catatan_admin || ""
      });
      setShowAdminModal(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Surat Digital</h1>
          <p className="text-muted-foreground">Pengajuan dan penerbitan surat pengantar RT/RW</p>
        </div>
        {can('surat', 'create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Ajukan Surat
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow">
          <FileText className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Total Pengajuan</p>
          <p className="text-3xl font-semibold">{suratList.length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-semibold text-foreground">{suratList.filter(s => s.status === 'pending').length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <FileSignature className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Diproses</p>
          <p className="text-3xl font-semibold text-foreground">{suratList.filter(s => s.status === 'diproses').length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Selesai</p>
          <p className="text-3xl font-semibold text-foreground">{suratList.filter(s => s.status === 'selesai').length}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {suratList.length === 0 ? (
           <div className="p-12 text-center text-muted-foreground">
             <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
             Belum ada data pengajuan surat.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Informasi Surat</th>
                  <th className="px-6 py-4">Pemohon</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suratList.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground mb-1">{s.jenis_surat}</div>
                      <div className="text-muted-foreground mb-1 line-clamp-1">{s.keperluan}</div>
                      <div className="text-xs text-muted-foreground">Tgl: {new Date(s.created_at).toLocaleDateString('id-ID')}</div>
                      {s.nomor_surat && <div className="text-xs font-medium text-primary mt-1">No: {s.nomor_surat}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {s.anggota_keluarga?.nama || s.warga?.nama || s.user?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.warga?.blok ? `Blok ${s.warga.blok}` : (s.user?.blok_rumah ? `Blok ${s.user.blok_rumah} No. ${s.user.nomor_rumah}` : '-')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[s.status]}`}>
                        {statusIcon[s.status]}
                        <span className="capitalize">{s.status}</span>
                      </div>
                      {s.catatan_admin && (
                         <div className="text-xs text-muted-foreground mt-2 max-w-[200px] line-clamp-2">
                            <span className="font-semibold">Catatan RT:</span> {s.catatan_admin}
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                       {roleName !== 'warga' && (
                         <button onClick={() => openAdminModal(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-medium text-xs transition-colors">
                           <Pencil className="w-3.5 h-3.5" />
                           Proses
                         </button>
                       )}
                       
                       <a href={`/surat/${s.id}/cetak`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium text-xs transition-colors">
                         <Printer className="w-3.5 h-3.5" />
                         Cetak
                       </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat Surat (Warga) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold">Ajukan Surat Pengantar</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pemohon Surat <span className="text-red-500">*</span></label>
                <select 
                    value={form.anggota_keluarga_id ? `A_${form.anggota_keluarga_id}_W_${form.warga_id}` : (form.warga_id ? `W_${form.warga_id}` : '')}
                    onChange={e => {
                        const val = e.target.value;
                        if (val.startsWith('W_')) {
                            setForm({...form, warga_id: Number(val.replace('W_', '')), anggota_keluarga_id: null});
                        } else if (val.startsWith('A_')) {
                            const parts = val.split('_');
                            setForm({...form, warga_id: Number(parts[3]), anggota_keluarga_id: Number(parts[1])});
                        } else {
                            setForm({...form, warga_id: null, anggota_keluarga_id: null});
                        }
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                >
                    <option value="">Pilih Pemohon...</option>
                    {pilihanWarga.map(w => (
                        <optgroup key={w.id} label={`Keluarga ${w.nama}`}>
                            <option value={`W_${w.id}`}>{w.nama} (Kepala Keluarga)</option>
                            {w.anggota_keluarga?.map(a => (
                                <option key={a.id} value={`A_${a.id}_W_${w.id}`}>{a.nama} (Anggota Keluarga)</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Surat <span className="text-red-500">*</span></label>
                <select 
                    value={form.jenis_surat} 
                    onChange={e => setForm({...form, jenis_surat: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none"
                >
                    {JENIS_SURAT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keperluan <span className="text-red-500">*</span></label>
                <textarea 
                    value={form.keperluan} 
                    onChange={e => setForm({...form, keperluan: e.target.value})}
                    placeholder="Contoh: Pembuatan KTP Baru, Syarat Menikah, dll"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keterangan Tambahan <span className="text-muted-foreground font-normal">(Opsional)</span></label>
                <input 
                    type="text"
                    value={form.keterangan_tambahan} 
                    onChange={e => setForm({...form, keterangan_tambahan: e.target.value})}
                    placeholder="Contoh: Mohon segera diproses, terima kasih"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-lg border border-border hover:bg-muted font-medium transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors">Ajukan Surat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin (Pengurus) */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold">Proses Surat</h2>
              <button onClick={() => setShowAdminModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status Pengajuan</label>
                <select 
                    value={adminForm.status} 
                    onChange={e => setAdminForm({...adminForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none"
                >
                    <option value="pending">Pending</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="selesai">Selesai (Siap Diambil/Dicetak)</option>
                    <option value="ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nomor Surat <span className="text-muted-foreground font-normal">(Isi jika sudah selesai)</span></label>
                <input 
                    type="text"
                    value={adminForm.nomor_surat} 
                    onChange={e => setAdminForm({...adminForm, nomor_surat: e.target.value})}
                    placeholder="Misal: 474.4/05/RT01/2026"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan RT <span className="text-muted-foreground font-normal">(Opsional)</span></label>
                <textarea 
                    value={adminForm.catatan_admin} 
                    onChange={e => setAdminForm({...adminForm, catatan_admin: e.target.value})}
                    placeholder="Pesan untuk warga terkait surat ini..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-2.5 rounded-lg border border-border hover:bg-muted font-medium transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
