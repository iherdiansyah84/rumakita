import { useState } from "react";
import { router } from "@inertiajs/react";
import { Calendar, Clock, MapPin, Users, Plus, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "../../../hooks/useRole";

type Agenda = {
  id: number;
  judul: string;
  tanggal: string;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  lokasi: string;
  tipe: string;
  penyelenggara: string;
  max_peserta: number | null;
  status: "upcoming" | "ongoing" | "completed";
};

type Props = { agenda: Agenda[] };

const TIPE_OPTIONS = ["Gotong Royong", "Rapat", "Kesehatan", "Olahraga", "Keagamaan", "Lainnya"];

const statusColor: Record<string, string> = {
  upcoming:  "bg-teal-100 text-teal-700",
  ongoing:   "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  judul: "", tanggal: "", waktu_mulai: "", waktu_selesai: "",
  lokasi: "", tipe: "Lainnya", penyelenggara: "", max_peserta: "", status: "upcoming" as const,
};

export function AgendaModule({ agenda = [] }: Props) {
  const { can } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Agenda | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(a: Agenda) {
    setEditing(a);
    setForm({
      judul:         a.judul,
      tanggal:       a.tanggal,
      waktu_mulai:   a.waktu_mulai ?? "",
      waktu_selesai: a.waktu_selesai ?? "",
      lokasi:        a.lokasi,
      tipe:          a.tipe,
      penyelenggara: a.penyelenggara,
      max_peserta:   a.max_peserta != null ? String(a.max_peserta) : "",
      status:        a.status,
    });
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, max_peserta: form.max_peserta ? Number(form.max_peserta) : null };

    if (editing) {
      router.patch(`/agenda/${editing.id}`, payload, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    } else {
      router.post("/agenda", payload, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/agenda/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  const upcoming = agenda.filter((a) => a.status !== "completed");
  const totalPeserta = agenda.reduce((s, a) => s + (a.max_peserta ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Agenda & Kegiatan</h1>
          <p className="text-muted-foreground">Jadwal kegiatan RT/RW dan perumahan</p>
        </div>
        {can('agenda', 'create') && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Agenda
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Total Agenda</p>
          <p className="text-3xl font-semibold">{agenda.length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Mendatang</p>
          <p className="text-3xl font-semibold text-foreground">{upcoming.length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Kapasitas</p>
          <p className="text-3xl font-semibold text-foreground">{totalPeserta}</p>
        </div>
      </div>

      <div className="space-y-4">
        {agenda.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
            Belum ada agenda. Klik "Tambah Agenda" untuk mulai.
          </div>
        )}
        {agenda.map((a) => (
          <div key={a.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">{a.judul}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">{a.tipe}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[a.status]}`}>
                      {a.status === "upcoming" ? "Mendatang" : a.status === "ongoing" ? "Berlangsung" : "Selesai"}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(a.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    {(a.waktu_mulai || a.waktu_selesai) && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{a.waktu_mulai}{a.waktu_selesai ? ` - ${a.waktu_selesai}` : ""}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{a.lokasi}</span>
                    </div>
                  </div>
                </div>
                {(can('agenda', 'update') || can('agenda', 'delete')) && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => openEdit(a)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(a.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Penyelenggara: <span className="font-medium text-foreground">{a.penyelenggara}</span>
                </p>
                {a.max_peserta && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Maks. {a.max_peserta} peserta</span>
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
          <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-semibold">{editing ? "Edit Agenda" : "Tambah Agenda"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul *</label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal *</label>
                  <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe *</label>
                  <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                    {TIPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Waktu Mulai</label>
                  <input type="time" value={form.waktu_mulai} onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Waktu Selesai</label>
                  <input type="time" value={form.waktu_selesai} onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lokasi *</label>
                <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Penyelenggara *</label>
                  <input value={form.penyelenggara} onChange={(e) => setForm({ ...form, penyelenggara: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maks. Peserta</label>
                  <input type="number" min="1" value={form.max_peserta} onChange={(e) => setForm({ ...form, max_peserta: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="upcoming">Mendatang</option>
                  <option value="ongoing">Berlangsung</option>
                  <option value="completed">Selesai</option>
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
            <h2 className="text-lg font-semibold mb-2">Hapus Agenda</h2>
            <p className="text-muted-foreground text-sm mb-5">Agenda ini akan dihapus permanen. Lanjutkan?</p>
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
