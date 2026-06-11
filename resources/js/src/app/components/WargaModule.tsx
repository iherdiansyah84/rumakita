import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import {
  Search, Download, UserPlus, MapPin, Phone, Pencil, Trash2, X,
  Upload, FileText, Users, ChevronDown, ChevronUp, Plus, Eye,
} from "lucide-react";
import { useAuth } from "../../../hooks/useRole";
import type { AnggotaKeluarga, WargaRow } from "../../../../Pages/Warga/Index";

type Perumahan = { id: number; nama: string };

type Stats = { total_kk: number; lunas: number; pending: number; tunggak: number };

type Props = {
  warga: WargaRow[];
  perumahan: Perumahan[];
  stats: Stats;
};

const statusColor: Record<string, string> = {
  lunas:   "bg-teal-100 text-teal-700",
  pending: "bg-amber-100 text-amber-700",
  tunggak: "bg-red-100 text-red-700",
};

const STATUS_HUBUNGAN = ["Suami", "Istri", "Anak", "Saudara", "Single"] as const;
const AGAMA_OPTIONS   = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const STATUS_KAWIN    = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];

type FormTab = "pribadi" | "dokumen" | "keluarga";

const emptyAnggota = (): AnggotaKeluarga => ({
  nama: "", status_hubungan: "Single", nik: "",
  tanggal_lahir: "", jenis_kelamin: "", pekerjaan: "",
});

const emptyForm = {
  perumahan_id: "",
  nama: "", nik: "", blok: "", no_hp: "", email: "",
  status_iuran: "pending" as const,
  tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "" as "L" | "P" | "",
  agama: "", pekerjaan: "", status_perkawinan: "", alamat_asal: "",
  tipe_dokumen: "" as "KTP" | "Passport" | "",
  no_dokumen: "",
  status_tinggal: "Tetap" as const,
  alamat_pindah: "",
};

export function WargaModule({ warga = [], perumahan = [], stats }: Props) {
  const { can, isSuperAdmin, isWarga } = useAuth();
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<WargaRow | null>(null);
  const [editing, setEditing]     = useState<WargaRow | null>(null);
  const [tab, setTab]             = useState<FormTab>("pribadi");
  const [form, setForm]           = useState(emptyForm);
  const [members, setMembers]     = useState<AnggotaKeluarga[]>([]);
  const [fotoKtp, setFotoKtp]     = useState<File | null>(null);
  const [fotoKk, setFotoKk]       = useState<File | null>(null);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const ktpRef = useRef<HTMLInputElement>(null);
  const kkRef  = useRef<HTMLInputElement>(null);

  const filtered = warga.filter((w) =>
    w.nama.toLowerCase().includes(search.toLowerCase()) ||
    w.blok.toLowerCase().includes(search.toLowerCase()) ||
    (w.nik ?? "").includes(search) ||
    (w.no_hp ?? "").includes(search)
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setMembers([]);
    setFotoKtp(null);
    setFotoKk(null);
    setErrors({});
    setTab("pribadi");
    setShowModal(true);
  }

  function openEdit(w: WargaRow) {
    setEditing(w);
    setForm({
      perumahan_id:     w.perumahan_id?.toString() ?? "",
      nama:             w.nama,
      nik:              w.nik ?? "",
      blok:             w.blok,
      no_hp:            w.no_hp ?? "",
      email:            w.email ?? "",
      status_iuran:     w.status_iuran,
      tempat_lahir:     w.tempat_lahir ?? "",
      tanggal_lahir:    w.tanggal_lahir ?? "",
      jenis_kelamin:    w.jenis_kelamin ?? "",
      agama:            w.agama ?? "",
      pekerjaan:        w.pekerjaan ?? "",
      status_perkawinan: w.status_perkawinan ?? "",
      alamat_asal:      w.alamat_asal ?? "",
      tipe_dokumen:     w.tipe_dokumen ?? "",
      no_dokumen:       w.no_dokumen ?? "",
      status_tinggal:   w.status_tinggal ?? "Tetap",
      alamat_pindah:    w.alamat_pindah ?? "",
    });
    setMembers(w.anggota_keluarga.map((a) => ({ ...a })));
    setFotoKtp(null);
    setFotoKk(null);
    setErrors({});
    setTab("pribadi");
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) data.append(k, String(v));
    });
    if (fotoKtp) data.append("foto_ktp", fotoKtp);
    if (fotoKk)  data.append("foto_kk", fotoKk);
    data.append("anggota_keluarga", JSON.stringify(members));

    const opts = {
      forceFormData: true,
      onSuccess: () => setShowModal(false),
      onError: (err: Record<string, string>) => setErrors(err),
    };

    if (editing) {
      data.append("_method", "PATCH");
      router.post(`/warga/${editing.id}`, data, opts);
    } else {
      router.post("/warga", data, opts);
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/warga/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  function handleGenerateUser(id: number) {
    if (confirm("Buat akun login untuk warga ini? Pastikan warga memiliki email yang valid.")) {
      router.post(`/warga/${id}/generate-user`, {}, {
        onSuccess: () => setShowDetail(null),
      });
    }
  }

  function addMember() {
    setMembers((prev) => [...prev, emptyAnggota()]);
  }

  function removeMember(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, field: keyof AnggotaKeluarga, value: string) {
    setMembers((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  const f = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Data Warga</h1>
          <p className="text-muted-foreground text-sm">Kelola data warga perumahan</p>
        </div>
        {can('warga', 'create') && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Warga
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total KK",  value: stats?.total_kk ?? warga.length, color: "text-foreground"  },
          { label: "Lunas",     value: stats?.lunas    ?? 0,             color: "text-teal-600"   },
          { label: "Pending",   value: stats?.pending  ?? 0,             color: "text-amber-600"  },
          { label: "Tunggak",   value: stats?.tunggak  ?? 0,             color: "text-red-600"    },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-5 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIK, blok, atau telepon..."
              className="w-full pl-9 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Nama / NIK</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Blok</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Kontak</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Dokumen</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Keluarga</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Iuran</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
                    Belum ada data warga.
                  </td>
                </tr>
              )}
              {filtered.map((w) => (
                <tr key={w.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-primary text-sm font-semibold">{w.nama.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{w.nama}</p>
                        <p className="text-xs text-muted-foreground">{w.nik ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{w.blok}</span>
                    </div>
                    {w.status_tinggal && (
                      <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        w.status_tinggal === 'Tetap' ? 'bg-blue-100 text-blue-700' :
                        w.status_tinggal === 'Kontrak' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {w.status_tinggal}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs">{w.no_hp ?? "—"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5">{w.email ?? "—"}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {w.foto_ktp_url
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs"><FileText className="w-3 h-3" />{w.tipe_dokumen ?? "ID"}</span>
                        : <span className="text-xs text-muted-foreground">—</span>
                      }
                      {w.foto_kk_url &&
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs"><FileText className="w-3 h-3" />KK</span>
                      }
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {w.anggota_keluarga.length > 0
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs"><Users className="w-3 h-3" />{w.anggota_keluarga.length} orang</span>
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[w.status_iuran]}`}>
                      {w.status_iuran.charAt(0).toUpperCase() + w.status_iuran.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowDetail(w)}
                        className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {can('warga', 'update') && (
                        <button onClick={() => openEdit(w)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {can('warga', 'delete') && (
                        <button onClick={() => setDeleteId(w.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold">{editing ? "Edit Data Warga" : "Tambah Warga Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
              {([
                { key: "pribadi",  label: "Data Pribadi" },
                { key: "dokumen",  label: "Dokumen" },
                { key: "keluarga", label: "Anggota Keluarga" },
              ] as { key: FormTab; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* ─── Tab: Data Pribadi ─────────────────── */}
                {tab === "pribadi" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Nama Lengkap *</label>
                        <input value={form.nama} onChange={(e) => f("nama", e.target.value)} className={inputCls} required />
                        {errors.nama && <p className="text-xs text-destructive mt-1">{errors.nama}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>NIK</label>
                        <input value={form.nik} onChange={(e) => f("nik", e.target.value)} maxLength={20} className={inputCls} placeholder="16 digit" />
                      </div>
                      <div>
                        <label className={labelCls}>Blok / Unit *</label>
                        <input value={form.blok} onChange={(e) => f("blok", e.target.value)} className={inputCls} required />
                        {errors.blok && <p className="text-xs text-destructive mt-1">{errors.blok}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Tempat Lahir</label>
                        <input value={form.tempat_lahir} onChange={(e) => f("tempat_lahir", e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Tanggal Lahir</label>
                        <input type="date" value={form.tanggal_lahir} onChange={(e) => f("tanggal_lahir", e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Jenis Kelamin</label>
                        <select value={form.jenis_kelamin} onChange={(e) => f("jenis_kelamin", e.target.value)} className={inputCls}>
                          <option value="">— Pilih —</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Agama</label>
                        <select value={form.agama} onChange={(e) => f("agama", e.target.value)} className={inputCls}>
                          <option value="">— Pilih —</option>
                          {AGAMA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Pekerjaan</label>
                        <input value={form.pekerjaan} onChange={(e) => f("pekerjaan", e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Status Perkawinan</label>
                        <select value={form.status_perkawinan} onChange={(e) => f("status_perkawinan", e.target.value)} className={inputCls}>
                          <option value="">— Pilih —</option>
                          {STATUS_KAWIN.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>No. HP</label>
                        <input value={form.no_hp} onChange={(e) => f("no_hp", e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Email</label>
                        <input type="email" value={form.email} onChange={(e) => f("email", e.target.value)} className={inputCls} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Alamat Asal</label>
                        <textarea value={form.alamat_asal} onChange={(e) => f("alamat_asal", e.target.value)} rows={2} className={inputCls + " resize-none"} />
                      </div>
                      <div>
                        <label className={labelCls}>Status Tinggal</label>
                        <select value={form.status_tinggal} onChange={(e) => f("status_tinggal", e.target.value as typeof form.status_tinggal)} className={inputCls}>
                          <option value="Tetap">Tetap</option>
                          <option value="Kontrak">Kontrak</option>
                          <option value="Pindah">Pindah</option>
                        </select>
                      </div>
                      {form.status_tinggal === 'Pindah' && (
                        <div className="col-span-2">
                          <label className={labelCls}>Alamat Pindah (Baru)</label>
                          <textarea value={form.alamat_pindah} onChange={(e) => f("alamat_pindah", e.target.value)} rows={2} className={inputCls + " resize-none"} placeholder="Alamat lengkap tujuan pindah" />
                        </div>
                      )}
                      {isSuperAdmin && (
                      <div>
                        <label className={labelCls}>Perumahan</label>
                        <select value={form.perumahan_id} onChange={(e) => f("perumahan_id", e.target.value)} className={inputCls}>
                          <option value="">— Pilih —</option>
                          {perumahan.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                        </select>
                      </div>
                      )}
                    </div>
                  </>
                )}

                {/* ─── Tab: Dokumen ──────────────────────── */}
                {tab === "dokumen" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Tipe Dokumen Identitas</label>
                        <select value={form.tipe_dokumen} onChange={(e) => f("tipe_dokumen", e.target.value as typeof form.tipe_dokumen)} className={inputCls}>
                          <option value="">— Pilih —</option>
                          <option value="KTP">KTP</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Nomor Dokumen</label>
                        <input value={form.no_dokumen} onChange={(e) => f("no_dokumen", e.target.value)} className={inputCls} placeholder="No. KTP / Passport" />
                      </div>
                    </div>

                    {/* KTP / Passport upload */}
                    <div>
                      <label className={labelCls}>Foto {form.tipe_dokumen || "KTP/Passport"}</label>
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => ktpRef.current?.click()}
                      >
                        {fotoKtp ? (
                          <p className="text-sm text-foreground font-medium">{fotoKtp.name}</p>
                        ) : editing?.foto_ktp_url ? (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">File tersimpan. Klik untuk mengganti.</p>
                            <a href={editing.foto_ktp_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline" onClick={(e) => e.stopPropagation()}>Lihat file</a>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">Klik untuk upload</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG, atau PDF maks. 5 MB</p>
                          </div>
                        )}
                      </div>
                      <input ref={ktpRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                        onChange={(e) => setFotoKtp(e.target.files?.[0] ?? null)} />
                      {errors.foto_ktp && <p className="text-xs text-destructive mt-1">{errors.foto_ktp}</p>}
                    </div>

                    {/* Kartu Keluarga upload */}
                    <div>
                      <label className={labelCls}>Kartu Keluarga (KK)</label>
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => kkRef.current?.click()}
                      >
                        {fotoKk ? (
                          <p className="text-sm text-foreground font-medium">{fotoKk.name}</p>
                        ) : editing?.foto_kk_url ? (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">File tersimpan. Klik untuk mengganti.</p>
                            <a href={editing.foto_kk_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline" onClick={(e) => e.stopPropagation()}>Lihat file</a>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">Klik untuk upload</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG, atau PDF maks. 5 MB</p>
                          </div>
                        )}
                      </div>
                      <input ref={kkRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                        onChange={(e) => setFotoKk(e.target.files?.[0] ?? null)} />
                      {errors.foto_kk && <p className="text-xs text-destructive mt-1">{errors.foto_kk}</p>}
                    </div>
                  </div>
                )}

                {/* ─── Tab: Anggota Keluarga ─────────────── */}
                {tab === "keluarga" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{members.length} anggota ditambahkan</p>
                      <button
                        type="button"
                        onClick={addMember}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Anggota
                      </button>
                    </div>

                    {members.length === 0 && (
                      <div className="py-10 text-center text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Belum ada anggota keluarga.</p>
                        <p className="text-xs mt-1">Klik "Tambah Anggota" untuk menambahkan.</p>
                      </div>
                    )}

                    {members.map((m, i) => (
                      <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Anggota #{i + 1}</span>
                          <button type="button" onClick={() => removeMember(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <label className={labelCls}>Nama *</label>
                            <input value={m.nama} onChange={(e) => updateMember(i, "nama", e.target.value)} className={inputCls} required />
                          </div>
                          <div>
                            <label className={labelCls}>Status Hubungan *</label>
                            <select value={m.status_hubungan} onChange={(e) => updateMember(i, "status_hubungan", e.target.value)} className={inputCls}>
                              {STATUS_HUBUNGAN.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>NIK</label>
                            <input value={m.nik} onChange={(e) => updateMember(i, "nik", e.target.value)} maxLength={20} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Tanggal Lahir</label>
                            <input type="date" value={m.tanggal_lahir} onChange={(e) => updateMember(i, "tanggal_lahir", e.target.value)} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Jenis Kelamin</label>
                            <select value={m.jenis_kelamin} onChange={(e) => updateMember(i, "jenis_kelamin", e.target.value)} className={inputCls}>
                              <option value="">—</option>
                              <option value="L">Laki-laki</option>
                              <option value="P">Perempuan</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>Pekerjaan</label>
                            <input value={m.pekerjaan} onChange={(e) => updateMember(i, "pekerjaan", e.target.value)} className={inputCls} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
                {tab !== "pribadi" && (
                  <button type="button" onClick={() => setTab(tab === "keluarga" ? "dokumen" : "pribadi")}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm">
                    <ChevronUp className="w-4 h-4 rotate-[-90deg]" /> Sebelumnya
                  </button>
                )}
                {tab !== "keluarga" ? (
                  <button type="button" onClick={() => setTab(tab === "pribadi" ? "dokumen" : "keluarga")}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm ml-auto">
                    Selanjutnya <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium ml-auto"
                >
                  {editing ? "Simpan Perubahan" : "Tambah Warga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">{showDetail.nama.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold">{showDetail.nama}</h2>
                  <p className="text-xs text-muted-foreground">Blok {showDetail.blok}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {showDetail.email && can('warga', 'update') && !isWarga && (
                  <button onClick={() => handleGenerateUser(showDetail.id)} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors font-medium">
                    Buat Akun Login
                  </button>
                )}
                <button onClick={() => setShowDetail(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <Section title="Data Pribadi">
                <Row label="NIK"               value={showDetail.nik} />
                <Row label="Tempat, Tgl Lahir" value={[showDetail.tempat_lahir, showDetail.tanggal_lahir].filter(Boolean).join(", ")} />
                <Row label="Jenis Kelamin"     value={showDetail.jenis_kelamin === "L" ? "Laki-laki" : showDetail.jenis_kelamin === "P" ? "Perempuan" : null} />
                <Row label="Agama"             value={showDetail.agama} />
                <Row label="Pekerjaan"         value={showDetail.pekerjaan} />
                <Row label="Status Kawin"      value={showDetail.status_perkawinan} />
                <Row label="No. HP"            value={showDetail.no_hp} />
                <Row label="Email"             value={showDetail.email} />
                <Row label="Alamat Asal"       value={showDetail.alamat_asal} />
                <Row label="Status Tinggal"    value={
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    showDetail.status_tinggal === 'Tetap' ? 'bg-blue-100 text-blue-700' :
                    showDetail.status_tinggal === 'Kontrak' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {showDetail.status_tinggal}
                  </span>
                } />
                {showDetail.status_tinggal === 'Pindah' && (
                  <Row label="Alamat Pindah"   value={showDetail.alamat_pindah} />
                )}
                <Row label="Status Iuran"      value={<span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[showDetail.status_iuran]}`}>{showDetail.status_iuran}</span>} />
              </Section>

              <Section title="Dokumen">
                <Row label="Tipe Dokumen"  value={showDetail.tipe_dokumen} />
                <Row label="No. Dokumen"   value={showDetail.no_dokumen} />
                <Row label={showDetail.tipe_dokumen ?? "KTP/Passport"} value={
                  showDetail.foto_ktp_url
                    ? <a href={showDetail.foto_ktp_url} target="_blank" rel="noreferrer" className="text-primary text-xs underline">Lihat file</a>
                    : null
                } />
                <Row label="Kartu Keluarga" value={
                  showDetail.foto_kk_url
                    ? <a href={showDetail.foto_kk_url} target="_blank" rel="noreferrer" className="text-primary text-xs underline">Lihat file</a>
                    : null
                } />
              </Section>

              {showDetail.anggota_keluarga.length > 0 && (
                <Section title={`Anggota Keluarga (${showDetail.anggota_keluarga.length})`}>
                  <div className="space-y-2">
                    {showDetail.anggota_keluarga.map((a, i) => (
                      <div key={i} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{a.nama}</span>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{a.status_hubungan}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {a.nik && <p>NIK: {a.nik}</p>}
                          {a.tanggal_lahir && <p>Tgl Lahir: {a.tanggal_lahir}</p>}
                          {a.jenis_kelamin && <p>{a.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</p>}
                          {a.pekerjaan && <p>Pekerjaan: {a.pekerjaan}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Hapus Warga</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Data warga beserta dokumen dan data keluarga akan dihapus permanen. Lanjutkan?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                Batal
              </button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3">
      <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="text-xs text-foreground flex-1">{value}</span>
    </div>
  );
}
