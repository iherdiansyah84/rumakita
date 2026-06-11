import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Image as ImageIcon, Calendar, Heart, Share2, Upload, X, Pencil, Trash2 } from "lucide-react";

type GaleriFoto = { id: number; url: string };

type Galeri = {
  id: number;
  user_id: number;
  uploader: string;
  judul: string;
  tanggal_kegiatan: string;
  kategori: string;
  foto: GaleriFoto[];
  created_at: string;
};

type PageProps = { auth: { user: { id: number; name: string } } };

type Props = { galeri: Galeri[] };

const KATEGORI = ["Gotong Royong", "Perayaan", "Kesehatan", "Olahraga", "Rapat", "Lainnya"];

const emptyForm = { judul: "", tanggal_kegiatan: "", kategori: "Lainnya" };

export function GaleriModule({ galeri = [] }: Props) {
  const { auth } = usePage<PageProps>().props;
  const [filterKat, setFilterKat] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Galeri | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<FileList | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = filterKat === "Semua" ? galeri : galeri.filter((g) => g.kategori === filterKat);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFiles(null);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(g: Galeri) {
    setEditing(g);
    setForm({ judul: g.judul, tanggal_kegiatan: g.tanggal_kegiatan, kategori: g.kategori });
    setFiles(null);
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editing) {
      router.patch(`/galeri/${editing.id}`, form, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    } else {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (files) Array.from(files).forEach((f) => data.append("foto[]", f));

      router.post("/galeri", data, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
        forceFormData: true,
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/galeri/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  const totalFoto  = galeri.reduce((s, g) => s + g.foto.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Galeri Kegiatan</h1>
          <p className="text-muted-foreground">Dokumentasi kegiatan warga perumahan</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Buat Album
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-2 flex-wrap">
        {["Semua", ...KATEGORI].map((k) => (
          <button
            key={k}
            onClick={() => setFilterKat(k)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              filterKat === k ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          Belum ada album galeri.
        </div>
      )}

      <div className="space-y-6">
        {filtered.map((g) => (
          <div key={g.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{g.judul}</h3>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">{g.kategori}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Oleh: {g.uploader}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{g.tanggal_kegiatan}</span>
                  </div>
                </div>
              </div>
              {auth.user.id === g.user_id && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-2 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(g.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {g.foto.length > 0 ? (
              <div className={`grid gap-2 p-2 ${
                g.foto.length === 1 ? "grid-cols-1" :
                g.foto.length === 2 ? "grid-cols-2" :
                g.foto.length === 3 ? "grid-cols-3" : "grid-cols-2"
              }`}>
                {g.foto.map((f, idx) => (
                  <div key={f.id} className={`relative overflow-hidden rounded-lg ${g.foto.length === 4 && idx === 0 ? "col-span-2" : ""}`} style={{ aspectRatio: "4/3" }}>
                    <img src={f.url} alt={`${g.judul} - ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">Belum ada foto dalam album ini.</div>
            )}

            <div className="p-4 border-t border-border flex items-center gap-4">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">Suka</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Bagikan</span>
              </button>
              <span className="ml-auto text-sm text-muted-foreground">{g.foto.length} foto</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-1">{galeri.length}</h3>
          <p className="text-sm text-muted-foreground">Total Album</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-1">{totalFoto}</h3>
          <p className="text-sm text-muted-foreground">Total Foto</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold">{editing ? "Edit Album" : "Buat Album Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Album *</label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Kegiatan *</label>
                  <input type="date" value={form.tanggal_kegiatan} onChange={(e) => setForm({ ...form, tanggal_kegiatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori *</label>
                  <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                    {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium mb-1">Upload Foto</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                  <p className="text-xs text-muted-foreground mt-1">Pilih satu atau lebih foto (maks. 5MB per foto)</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">{editing ? "Simpan" : "Buat Album"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Hapus Album</h2>
            <p className="text-muted-foreground text-sm mb-5">Album dan semua fotonya akan dihapus permanen. Lanjutkan?</p>
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
