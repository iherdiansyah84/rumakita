import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { MessageSquare, ThumbsUp, MessageCircle, Send, X, Pencil, Trash2 } from "lucide-react";

type Diskusi = {
  id: number;
  user_id: number;
  user: string;
  judul: string;
  konten: string;
  kategori: string;
  likes: number;
  komentar_count: number;
  created_at: string;
};

type PageProps = { auth: { user: { id: number; name: string } } };

type Props = { diskusi: Diskusi[] };

const KATEGORI = ["Keamanan", "Kesehatan", "Infrastruktur", "Sosial", "Lainnya"];

const kategoriColor: Record<string, string> = {
  Keamanan:       "bg-red-100 text-red-700",
  Kesehatan:      "bg-green-100 text-green-700",
  Infrastruktur:  "bg-blue-100 text-blue-700",
  Sosial:         "bg-purple-100 text-purple-700",
  Lainnya:        "bg-gray-100 text-gray-700",
};

const emptyForm = { judul: "", konten: "", kategori: "Lainnya" };

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Baru saja";
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export function ForumModule({ diskusi = [] }: Props) {
  const { auth } = usePage<PageProps>().props;
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Diskusi | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [komentarText, setKomentarText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = filterKategori === "Semua"
    ? diskusi
    : diskusi.filter((d) => d.kategori === filterKategori);

  const kategoriBaru: Record<string, number> = { Semua: diskusi.length };
  KATEGORI.forEach((k) => { kategoriBaru[k] = diskusi.filter((d) => d.kategori === k).length; });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(d: Diskusi) {
    setEditing(d);
    setForm({ judul: d.judul, konten: d.konten, kategori: d.kategori });
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      router.patch(`/forum/${editing.id}`, form, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    } else {
      router.post("/forum", form, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/forum/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  function handleLike(id: number) {
    router.post(`/forum/${id}/like`);
  }

  function sendKomentar(diskusiId: number) {
    if (!komentarText.trim()) return;
    router.post(`/forum/${diskusiId}/komentar`, { konten: komentarText }, {
      onSuccess: () => setKomentarText(""),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Forum Diskusi</h1>
          <p className="text-muted-foreground">Ruang diskusi dan aspirasi warga</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Buat Diskusi Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Kategori</h3>
            <div className="space-y-2">
              {["Semua", ...KATEGORI].map((k) => (
                <button
                  key={k}
                  onClick={() => setFilterKategori(k)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    filterKategori === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className="text-sm">{k}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${filterKategori === k ? "bg-white/20" : "bg-muted"}`}>
                    {kategoriBaru[k] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {filtered.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              Belum ada diskusi. Mulai yang pertama!
            </div>
          )}
          {filtered.map((d) => (
            <div key={d.id} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">{d.user.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{d.user}</span>
                      <span className="text-xs text-muted-foreground">• {timeAgo(d.created_at)}</span>
                    </div>
                    {(auth.user.id === d.user_id) && (
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(d)} className="p-1.5 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${kategoriColor[d.kategori] ?? "bg-gray-100 text-gray-700"}`}>
                    {d.kategori}
                  </span>
                  <h2 className="text-lg font-semibold text-foreground mb-2">{d.judul}</h2>
                  <p className="text-muted-foreground mb-4 whitespace-pre-line">{d.konten}</p>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleLike(d.id)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{d.likes}</span>
                    </button>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{d.komentar_count} Komentar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-3">Tulis komentar atau mulai diskusi di forum ini</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-medium">{auth.user.name.charAt(0)}</span>
              </div>
              <input
                type="text"
                value={komentarText}
                onChange={(e) => setKomentarText(e.target.value)}
                placeholder="Tulis komentar..."
                className="flex-1 px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered[0]) sendKomentar(filtered[0].id);
                }}
              />
              <button
                onClick={() => filtered[0] && sendKomentar(filtered[0].id)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-semibold">{editing ? "Edit Diskusi" : "Buat Diskusi Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul *</label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                {errors.judul && <p className="text-xs text-destructive mt-1">{errors.judul}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori *</label>
                <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                  {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Isi Diskusi *</label>
                <textarea rows={5} value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" required />
                {errors.konten && <p className="text-xs text-destructive mt-1">{errors.konten}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">{editing ? "Simpan" : "Posting"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Hapus Diskusi</h2>
            <p className="text-muted-foreground text-sm mb-5">Diskusi ini beserta komentarnya akan dihapus permanen. Lanjutkan?</p>
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
