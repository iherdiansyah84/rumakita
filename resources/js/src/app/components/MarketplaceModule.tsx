import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { ShoppingBag, Search, MapPin, Clock, Heart, Plus, X, Pencil, Trash2 } from "lucide-react";

type Produk = {
  id: number;
  user_id: number;
  penjual: string;
  judul: string;
  deskripsi: string | null;
  harga: number;
  kategori: string;
  tipe_iklan: "Jual" | "Sewa";
  gambar: string[];
  status: "active" | "sold";
  likes_count?: number;
  is_liked?: boolean;
  created_at: string;
};

type PageProps = { auth: { user: { id: number; name: string } } };
type Props = { produk: Produk[] };

const KATEGORI = ["Furniture", "Elektronik", "Tanaman", "Olahraga", "Jasa", "Lainnya"];

const emptyForm = { judul: "", deskripsi: "", harga: "", kategori: "Lainnya", tipe_iklan: "Jual" as const, status: "active" as const };

function formatRp(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Baru saja";
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}

export function MarketplaceModule({ produk = [] }: Props) {
  const { auth } = usePage<PageProps>().props;
  const [search, setSearch] = useState("");
  const [filterKat, setFilterKat] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Produk | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [gambarFiles, setGambarFiles] = useState<File[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = produk
    .filter((p) => filterKat === "Semua" || p.kategori === filterKat)
    .filter((p) =>
      p.judul.toLowerCase().includes(search.toLowerCase()) ||
      p.penjual.toLowerCase().includes(search.toLowerCase())
    );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setGambarFiles([]);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(p: Produk) {
    setEditing(p);
    setForm({
      judul:     p.judul,
      deskripsi: p.deskripsi ?? "",
      harga:     String(p.harga),
      kategori:  p.kategori,
      tipe_iklan: p.tipe_iklan,
      status:    p.status,
    });
    setGambarFiles([]);
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    gambarFiles.forEach((file) => data.append("gambar[]", file));

    if (editing) {
      router.post(`/marketplace/${editing.id}/update`, data, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
        forceFormData: true,
      });
    } else {
      router.post("/marketplace", data, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
        forceFormData: true,
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/marketplace/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Marketplace Warga</h1>
          <p className="text-muted-foreground">Jual beli antar warga perumahan</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/pesanan"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            Pesanan
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Pasang Iklan
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari barang atau jasa..."
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["Semua", ...KATEGORI].map((k) => (
            <button
              key={k}
              onClick={() => setFilterKat(k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterKat === k ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          {produk.length === 0 ? "Belum ada iklan. Jadilah yang pertama!" : "Tidak ada iklan yang sesuai."}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group">
            <Link href={`/marketplace/${p.id}`} className="relative h-48 overflow-hidden bg-muted block cursor-pointer">
              {p.gambar && p.gambar.length > 0 ? (
                <>
                  <img src={p.gambar[0]} alt={p.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {p.gambar.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-lg pointer-events-none">
                      1 / {p.gambar.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingBag className="w-16 h-16 opacity-30" />
                </div>
              )}
              <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </button>
              <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                {p.tipe_iklan} - {p.kategori}
              </span>
              {p.status === "sold" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">TERJUAL</span>
                </div>
              )}
            </Link>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                <Link href={`/marketplace/${p.id}`} className="hover:text-primary transition-colors">
                  {p.judul}
                </Link>
              </h3>
              <p className="text-2xl font-bold text-primary mb-3">{formatRp(p.harga)}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{timeAgo(p.created_at)}</span>
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        router.post(`/marketplace/${p.id}/like`, {}, { preserveScroll: true });
                      }}
                      className={`flex items-center gap-1 hover:text-red-500 transition-colors ${p.is_liked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${p.is_liked ? 'fill-current' : ''}`} />
                      <span>{p.likes_count || 0}</span>
                    </button>
                  </div>
                  <span className="font-medium text-foreground">{p.penjual}</span>
                </div>
                {auth.user.id === p.user_id && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-semibold">{editing ? "Edit Iklan" : "Pasang Iklan Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul *</label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Harga (Rp) *</label>
                  <input type="number" min="0" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe Iklan *</label>
                  <select value={form.tipe_iklan} onChange={(e) => setForm({ ...form, tipe_iklan: e.target.value as typeof form.tipe_iklan })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Jual">Jual</option>
                    <option value="Sewa">Sewa</option>
                  </select>
                </div>
              </div>
              {editing && (
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="active">Aktif</option>
                    <option value="sold">Terjual</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Foto Produk (Bisa lebih dari 1)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setGambarFiles(e.target.files ? Array.from(e.target.files) : [])}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">{editing ? "Simpan" : "Pasang"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Hapus Iklan</h2>
            <p className="text-muted-foreground text-sm mb-5">Iklan ini akan dihapus permanen. Lanjutkan?</p>
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
