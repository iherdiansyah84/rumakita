import { useState } from "react";
import { router } from "@inertiajs/react";
import { Wallet, TrendingUp, TrendingDown, Download, Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Transaksi = {
  id: number;
  tanggal: string;
  deskripsi: string;
  tipe: "in" | "out";
  jumlah: number;
  kategori: string | null;
  warga_id?: number | null;
  warga?: { id: number; nama: string; blok: string } | null;
  details?: TransaksiDetail[];
};

export type TransaksiDetail = {
  id?: number;
  nama_iuran: string;
  bulan: number;
  tahun: number;
  jumlah: number;
};

type Warga = {
  id: number;
  nama: string;
  blok: string;
};

type Stats = {
  saldo: number;
  pemasukan: number;
  pengeluaran: number;
};

type Props = {
  transaksi: Transaksi[];
  wargaList?: Warga[];
  stats: Stats;
};

const emptyForm = {
  tanggal: new Date().toISOString().split("T")[0],
  deskripsi: "",
  tipe: "in" as "in" | "out",
  jumlah: "",
  kategori: "",
  warga_id: "",
  details: [] as TransaksiDetail[],
};

function formatRp(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function buildMonthlyData(transaksi: Transaksi[]) {
  const map: Record<string, { bulan: string; pemasukan: number; pengeluaran: number }> = {};
  transaksi.forEach((t) => {
    const d = new Date(t.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("id-ID", { month: "short", year: "2-digit" });
    if (!map[key]) map[key] = { bulan: label, pemasukan: 0, pengeluaran: 0 };
    if (t.tipe === "in") map[key].pemasukan += t.jumlah;
    else map[key].pengeluaran += t.jumlah;
  });
  return Object.values(map).slice(-6);
}

export function KeuanganModule({ transaksi = [], wargaList = [], stats }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Transaksi | null>(null);
  const [editing, setEditing] = useState<Transaksi | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isIuranWarga = form.kategori === "Iuran Warga";

  const monthlyData = buildMonthlyData(transaksi);
  const recent      = [...transaksi].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 8);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(t: Transaksi) {
    setEditing(t);
    setForm({
      tanggal:   t.tanggal,
      deskripsi: t.deskripsi,
      tipe:      t.tipe,
      jumlah:    String(t.jumlah),
      kategori:  t.kategori ?? "",
      warga_id:  t.warga_id ? String(t.warga_id) : "",
      details:   t.details ? [...t.details] : [],
    });
    setErrors({});
    setShowModal(true);
  }

  function addDetailRow() {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { nama_iuran: "Iuran Bulanan", bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(), jumlah: 50000 }]
    }));
  }

  function removeDetailRow(index: number) {
    setForm(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  }

  function updateDetailRow(index: number, key: keyof TransaksiDetail, value: any) {
    setForm(prev => {
      const newDetails = [...prev.details];
      newDetails[index] = { ...newDetails[index], [key]: value };
      return { ...prev, details: newDetails };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let totalJumlah = Number(form.jumlah);
    if (isIuranWarga) {
      totalJumlah = form.details.reduce((sum, d) => sum + Number(d.jumlah), 0);
    }
    const payload = { ...form, jumlah: totalJumlah };

    if (editing) {
      router.patch(`/keuangan/${editing.id}`, payload, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    } else {
      router.post("/keuangan", payload, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/keuangan/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  const saldo      = stats?.saldo      ?? 0;
  const pemasukan  = stats?.pemasukan  ?? 0;
  const pengeluaran = stats?.pengeluaran ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Keuangan</h1>
          <p className="text-muted-foreground">Kelola kas dan iuran warga</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
            <Download className="w-5 h-5" />
            Laporan
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Transaksi Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-8 h-8 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Saldo</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Saldo Kas</h3>
          <p className="text-2xl font-semibold">{formatRp(saldo)}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Pemasukan</h3>
          <p className="text-2xl font-semibold text-foreground">{formatRp(pemasukan)}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
            <TrendingDown className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Pengeluaran</h3>
          <p className="text-2xl font-semibold text-foreground">{formatRp(pengeluaran)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Grafik Keuangan</h2>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Belum ada data transaksi.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="bulan" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}Jt`} />
                <Tooltip formatter={(v: number) => formatRp(v)} contentStyle={{ borderRadius: "8px" }} />
                <Bar dataKey="pemasukan" fill="#0d9488" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pengeluaran" fill="#fb923c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Transaksi Terbaru</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${t.tipe === "in" ? "bg-teal-100" : "bg-orange-100"}`}>
                      {t.tipe === "in" ? <TrendingUp className="w-5 h-5 text-teal-600" /> : <TrendingDown className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.deskripsi}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className={`text-sm font-semibold ${t.tipe === "in" ? "text-teal-600" : "text-orange-600"}`}>
                      {t.tipe === "in" ? "+" : "-"}{formatRp(t.jumlah)}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <button onClick={() => setShowDetailModal(t)} className="p-1 text-muted-foreground hover:text-blue-600">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(t)} className="p-1 text-muted-foreground hover:text-primary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold">{editing ? "Edit Transaksi" : "Transaksi Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe *</label>
                  <select
                    value={form.tipe}
                    onChange={(e) => setForm({ ...form, tipe: e.target.value as "in" | "out" })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="in">Pemasukan</option>
                    <option value="out">Pengeluaran</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi *</label>
                <input
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                {errors.deskripsi && <p className="text-xs text-destructive mt-1">{errors.deskripsi}</p>}
              </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, kategori: val, tipe: val === "Iuran Warga" ? "in" : form.tipe });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Umum</option>
                    <option value="Iuran Warga">Iuran Warga</option>
                    <option value="Gaji Pegawai">Gaji Pegawai</option>
                    <option value="Operasional">Operasional</option>
                  </select>
                </div>

              {isIuranWarga && (
                <div>
                  <label className="block text-sm font-medium mb-1">Pilih Warga *</label>
                  <select
                    value={form.warga_id}
                    onChange={(e) => setForm({ ...form, warga_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    required={isIuranWarga}
                  >
                    <option value="">— Pilih Warga —</option>
                    {wargaList.map(w => (
                      <option key={w.id} value={w.id}>{w.nama} (Blok {w.blok})</option>
                    ))}
                  </select>
                  {errors.warga_id && <p className="text-xs text-destructive mt-1">{errors.warga_id}</p>}
                </div>
              )}

              {isIuranWarga ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Detail Iuran *</label>
                    <button type="button" onClick={addDetailRow} className="text-xs flex items-center gap-1 text-primary hover:text-primary/80">
                      <Plus className="w-3.5 h-3.5" /> Tambah Baris
                    </button>
                  </div>
                  {form.details.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-lg">Belum ada detail iuran</p>
                  )}
                  {form.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <select
                          value={d.nama_iuran}
                          onChange={(e) => updateDetailRow(i, "nama_iuran", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                          required
                        >
                          <option value="Iuran Bulanan">Iuran Bulanan</option>
                          <option value="Iuran Sampah">Iuran Sampah</option>
                          <option value="Iuran Keamanan">Iuran Keamanan</option>
                          <option value="Iuran Lainnya">Iuran Lainnya</option>
                        </select>
                      </div>
                      <div className="w-16 space-y-1">
                        <input
                          type="number"
                          min="1" max="12"
                          value={d.bulan}
                          onChange={(e) => updateDetailRow(i, "bulan", Number(e.target.value))}
                          placeholder="Bln"
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                          required
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <input
                          type="number"
                          min="2000"
                          value={d.tahun}
                          onChange={(e) => updateDetailRow(i, "tahun", Number(e.target.value))}
                          placeholder="Thn"
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="number"
                          min="0"
                          value={d.jumlah}
                          onChange={(e) => updateDetailRow(i, "jumlah", Number(e.target.value))}
                          placeholder="Jumlah"
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                          required
                        />
                      </div>
                      <button type="button" onClick={() => removeDetailRow(i)} className="p-1.5 mt-0.5 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between items-center bg-muted px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium">Total Iuran:</span>
                    <span className="font-semibold text-primary">{formatRp(form.details.reduce((sum, d) => sum + Number(d.jumlah), 0))}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Jumlah (Rp) *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.jumlah}
                      onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required={!isIuranWarga}
                    />
                    {errors.jumlah && <p className="text-xs text-destructive mt-1">{errors.jumlah}</p>}
                  </div>
                </div>
              )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    {editing ? "Simpan" : "Catat"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Hapus Transaksi</h2>
            <p className="text-muted-foreground text-sm mb-5">Transaksi ini akan dihapus permanen. Lanjutkan?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detail Transaksi</h2>
              <button onClick={() => setShowDetailModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-muted-foreground">Tanggal</div>
                <div className="font-medium text-right">{new Date(showDetailModal.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                <div className="text-muted-foreground">Tipe</div>
                <div className="font-medium text-right capitalize">{showDetailModal.tipe === "in" ? "Pemasukan" : "Pengeluaran"}</div>
                <div className="text-muted-foreground">Kategori</div>
                <div className="font-medium text-right">{showDetailModal.kategori || "Umum"}</div>
                <div className="text-muted-foreground">Deskripsi</div>
                <div className="font-medium text-right">{showDetailModal.deskripsi}</div>
                <div className="text-muted-foreground">Total Jumlah</div>
                <div className="font-semibold text-right text-primary">{formatRp(showDetailModal.jumlah)}</div>
              </div>

              {showDetailModal.kategori === "Iuran Warga" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-2">Rincian Iuran Warga</h3>
                  {showDetailModal.warga && (
                    <div className="text-sm mb-3">
                      Warga: <span className="font-medium">{showDetailModal.warga.nama}</span> (Blok {showDetailModal.warga.blok})
                    </div>
                  )}
                  {showDetailModal.details && showDetailModal.details.length > 0 ? (
                    <div className="space-y-2">
                      {showDetailModal.details.map((d, i) => (
                        <div key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg text-sm">
                          <div>
                            <span className="font-medium">{d.nama_iuran}</span>
                            <span className="text-muted-foreground ml-2 text-xs">Periode: {String(d.bulan).padStart(2, '0')}/{d.tahun}</span>
                          </div>
                          <span className="font-medium">{formatRp(d.jumlah)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Tidak ada rincian baris iuran.</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6">
              <button onClick={() => setShowDetailModal(null)} className="w-full py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
