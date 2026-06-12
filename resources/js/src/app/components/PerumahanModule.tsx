import { useState } from "react";
import { router } from "@inertiajs/react";
import { Building2, Users, MapPin, Plus, Settings, BarChart, X, Pencil, Trash2 } from "lucide-react";

type Perumahan = {
  id: number;
  nama: string;
  lokasi: string;
  admin_nama: string;
  telepon: string | null;
  email: string | null;
  total_unit: number;
  status: "active" | "inactive";
  warga_count: number;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kota: string | null;
  provinsi: string | null;
  kode_pos: string | null;
};

type Props = { perumahan: Perumahan[] };

const emptyForm = {
  nama: "", lokasi: "", admin_nama: "",
  telepon: "",
  email: "",
  total_unit: 100,
  status: "active" as const,
  rt: "",
  rw: "",
  kelurahan: "",
  kecamatan: "",
  kota: "",
  provinsi: "",
  kode_pos: "",
};

export function PerumahanModule({ perumahan = [] }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Perumahan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(p: Perumahan) {
    setEditing(p);
    setForm({
      nama:       p.nama,
      lokasi:     p.lokasi,
      admin_nama: p.admin_nama,
      telepon: p.telepon || "",
      email: p.email || "",
      total_unit: p.total_unit,
      status: p.status,
      rt: p.rt || "",
      rw: p.rw || "",
      kelurahan: p.kelurahan || "",
      kecamatan: p.kecamatan || "",
      kota: p.kota || "",
      provinsi: p.provinsi || "",
      kode_pos: p.kode_pos || "",
    });
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, total_unit: Number(form.total_unit) };

    if (editing) {
      router.patch(`/perumahan/${editing.id}`, payload, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    } else {
      router.post("/perumahan", payload, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/perumahan/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  const totalWarga = perumahan.reduce((s, p) => s + p.warga_count, 0);
  const totalUnit  = perumahan.reduce((s, p) => s + p.total_unit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Kelola Perumahan</h1>
          <p className="text-muted-foreground">Manajemen multi perumahan dalam satu sistem</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Perumahan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <Building2 className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Total Perumahan</p>
          <p className="text-3xl font-semibold">{perumahan.length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Warga Terdaftar</p>
          <p className="text-3xl font-semibold text-foreground">{totalWarga.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <BarChart className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Unit</p>
          <p className="text-3xl font-semibold text-foreground">{totalUnit.toLocaleString()}</p>
        </div>
      </div>

      {perumahan.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          Belum ada data perumahan. Klik "Tambah Perumahan" untuk mulai.
        </div>
      )}

      <div className="space-y-4">
        {perumahan.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{p.nama}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.status === "active" ? "Aktif" : "Non-Aktif"}
                        </span>
                        {(p.rt || p.rw) && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground border border-border">
                              RT {p.rt || '-'} / RW {p.rw || '-'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-2">{p.lokasi} {p.kota ? `- ${p.kota}` : ''}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Unit</p>
                        <p className="text-sm font-semibold text-foreground">{p.total_unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Warga Terdaftar</p>
                        <p className="text-sm font-semibold text-foreground">{p.warga_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Admin</p>
                        <p className="text-sm font-semibold text-foreground">{p.admin_nama}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {(p.telepon || p.email) && (
              <div className="bg-muted px-6 py-3 flex items-center gap-6 text-sm text-muted-foreground">
                {p.telepon && <span>{p.telepon}</span>}
                {p.email && <span>{p.email}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-semibold">{editing ? "Edit Perumahan" : "Tambah Perumahan"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Perumahan *</label>
                <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                {errors.nama && <p className="text-xs text-destructive mt-1">{errors.nama}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lokasi *</label>
                <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Admin *</label>
                  <input value={form.admin_nama} onChange={(e) => setForm({ ...form, admin_nama: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Unit *</label>
                  <input type="number" min="1" value={form.total_unit} onChange={(e) => setForm({ ...form, total_unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Telepon</label>
                  <input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mt-2">
                <h3 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Identitas Wilayah (Opsional)</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">RT</label>
                    <input type="text" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">RW</label>
                    <input type="text" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="005" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kelurahan / Desa</label>
                    <input type="text" value={form.kelurahan} onChange={(e) => setForm({ ...form, kelurahan: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Sukamaju" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kecamatan</label>
                    <input type="text" value={form.kecamatan} onChange={(e) => setForm({ ...form, kecamatan: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Cilodong" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kota / Kabupaten</label>
                    <input type="text" value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Depok" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Provinsi</label>
                    <input type="text" value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Jawa Barat" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Kode Pos</label>
                    <input type="text" value={form.kode_pos} onChange={(e) => setForm({ ...form, kode_pos: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="16415" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">{editing ? "Simpan" : "Tambah"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Hapus Perumahan</h2>
            <p className="text-muted-foreground text-sm mb-5">Perumahan ini akan dihapus. Data warga terkait tidak ikut terhapus. Lanjutkan?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
