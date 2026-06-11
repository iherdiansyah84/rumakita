import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Image as ImageIcon, Calendar, Heart, Share2, Upload, X, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [lightbox, setLightbox] = useState<{ galeri: Galeri; index: number } | null>(null);

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

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (files) Array.from(files).forEach((f) => data.append("foto[]", f));

    if (editing) {
      data.append("_method", "patch");
      router.post(`/galeri/${editing.id}`, data, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
        forceFormData: true,
      });
    } else {
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

  function nextPhoto() {
    if (!lightbox) return;
    const maxIndex = lightbox.galeri.foto.length - 1;
    setLightbox({ ...lightbox, index: lightbox.index < maxIndex ? lightbox.index + 1 : 0 });
  }

  function prevPhoto() {
    if (!lightbox) return;
    const maxIndex = lightbox.galeri.foto.length - 1;
    setLightbox({ ...lightbox, index: lightbox.index > 0 ? lightbox.index - 1 : maxIndex });
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
                    <img src={f.url} alt={`${g.judul} - ${idx + 1}`} onClick={() => setLightbox({ galeri: g, index: idx })} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
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
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  Ada kesalahan pada isian form Anda. Silakan periksa kembali.
                  {errors.foto && <p className="mt-1 font-medium">{errors.foto}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Judul Album *</label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Kegiatan *</label>
                  <input type="date" value={form.tanggal_kegiatan} onChange={(e) => setForm({ ...form, tanggal_kegiatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                  {errors.tanggal_kegiatan && <p className="text-xs text-red-500 mt-1">{errors.tanggal_kegiatan}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori *</label>
                  <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                    {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  {errors.kategori && <p className="text-xs text-red-500 mt-1">{errors.kategori}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{editing ? "Tambah Foto Baru" : "Upload Foto"}</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                <p className="text-xs text-muted-foreground mt-1">Pilih satu atau lebih foto (maks. 5MB per foto)</p>
                {/* Tampilkan error dari foto individual (foto.0, foto.1, dst) */}
                {Object.entries(errors)
                  .filter(([key]) => key.startsWith('foto.'))
                  .map(([key, msg]) => (
                    <p key={key} className="text-xs text-red-500 mt-1">{msg}</p>
                  ))
                }
              </div>

              {editing && editing.foto.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Foto Saat Ini</label>
                  <div className="grid grid-cols-3 gap-2">
                    {editing.foto.map(f => (
                      <div key={f.id} className="relative group rounded-lg overflow-hidden border border-border" style={{ aspectRatio: "4/3" }}>
                        <img src={f.url} alt="foto" className="w-full h-full object-cover" />
                        <button type="button" 
                                onClick={() => router.delete(`/galeri/foto/${f.id}`, { preserveScroll: true, onSuccess: () => {
                                  setEditing(prev => prev ? { ...prev, foto: prev.foto.filter(photo => photo.id !== f.id) } : prev);
                                }})}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
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

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
          
          {lightbox.galeri.foto.length > 1 && (
            <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img 
              src={lightbox.galeri.foto[lightbox.index].url} 
              alt="Lightbox" 
              className="max-w-full max-h-[80vh] object-contain rounded-md select-none"
            />
            <div className="text-white mt-4 text-center">
              <h3 className="font-semibold text-lg">{lightbox.galeri.judul}</h3>
              <p className="text-sm text-white/70">{lightbox.index + 1} / {lightbox.galeri.foto.length}</p>
            </div>
          </div>

          {lightbox.galeri.foto.length > 1 && (
            <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white/70 hover:text-white transition-colors">
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
