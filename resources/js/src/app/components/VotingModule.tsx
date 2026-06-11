import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Vote, Clock, CheckCircle, Users, BarChart2, Plus, X, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../../hooks/useRole";

type Pilihan = {
  id: number;
  nama: string;
  votes: number;
  percentage: number;
};

type VotingItem = {
  id: number;
  judul: string;
  deskripsi: string | null;
  deadline: string | null;
  status: "active" | "completed";
  total_suara: number;
  sudah_pilih: boolean;
  pilihan: Pilihan[];
};

type PageProps = { auth: { user: { id: number } } };
type Props = { voting: VotingItem[] };

const emptyForm = { judul: "", deskripsi: "", deadline: "", status: "active" as const };

export function VotingModule({ voting = [] }: Props) {
  const { auth } = usePage<PageProps>().props;
  const { can } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VotingItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pilihan, setPilihan] = useState(["", ""]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setPilihan(["", ""]);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(v: VotingItem) {
    setEditing(v);
    setForm({ judul: v.judul, deskripsi: v.deskripsi ?? "", deadline: v.deadline ?? "", status: v.status });
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      router.patch(`/voting/${editing.id}`, form, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    } else {
      router.post("/voting", { ...form, pilihan: pilihan.filter(Boolean) }, {
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/voting/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  function handleVote(votingId: number, pilihanId: number) {
    router.post(`/voting/${votingId}/vote`, { pilihan_id: pilihanId });
  }

  const aktif   = voting.filter((v) => v.status === "active").length;
  const selesai = voting.filter((v) => v.status === "completed").length;
  const avgPart = voting.length > 0
    ? Math.round(voting.reduce((s, v) => s + (v.total_suara > 0 ? 1 : 0), 0) / voting.length * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Voting Online</h1>
          <p className="text-muted-foreground">Sistem voting demokratis untuk keputusan bersama</p>
        </div>
        {can('voting', 'create') && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Voting Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Voting Aktif",   value: aktif,   icon: Vote,         bg: "bg-teal-100",  col: "text-teal-600"   },
          { label: "Voting Selesai", value: selesai, icon: CheckCircle,  bg: "bg-purple-100",col: "text-purple-600" },
          { label: "Total Voting",   value: voting.length, icon: Users,  bg: "bg-orange-100",col: "text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-6 border border-border">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-6 h-6 ${s.col}`} />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">{s.label}</h3>
            <p className="text-3xl font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {voting.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          Belum ada voting. Buat yang pertama!
        </div>
      )}

      <div className="space-y-4">
        {voting.map((v) => (
          <div key={v.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-foreground">{v.judul}</h2>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${v.status === "active" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-700"}`}>
                      {v.status === "active" ? "Berlangsung" : "Selesai"}
                    </span>
                  </div>
                  {v.deskripsi && <p className="text-muted-foreground mb-3">{v.deskripsi}</p>}
                  {v.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Deadline: {v.deadline}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex flex-col items-center justify-center text-white">
                    <BarChart2 className="w-5 h-5 mb-0.5" />
                    <p className="text-lg font-bold">{v.total_suara}</p>
                  </div>
                  {(can('voting', 'update') || can('voting', 'delete')) && (
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openEdit(v)} className="p-1.5 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(v.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {v.pilihan.map((p) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{p.nama}</span>
                      <span className="text-sm text-muted-foreground">{p.votes} suara ({p.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500" style={{ width: `${p.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {v.status === "active" && !v.sudah_pilih && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Pilih satu opsi:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {v.pilihan.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleVote(v.id, p.id)}
                        className="py-2.5 px-4 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium"
                      >
                        {p.nama}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {v.sudah_pilih && v.status === "active" && (
                <p className="text-sm text-teal-600 font-medium">✓ Anda sudah memberikan suara</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-semibold">{editing ? "Edit Voting" : "Buat Voting Baru"}</h2>
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
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="active">Aktif</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm font-medium mb-2">Pilihan (min. 2) *</label>
                  <div className="space-y-2">
                    {pilihan.map((p, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={p} onChange={(e) => {
                          const n = [...pilihan]; n[i] = e.target.value; setPilihan(n);
                        }} placeholder={`Pilihan ${i + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                        {pilihan.length > 2 && (
                          <button type="button" onClick={() => setPilihan(pilihan.filter((_, j) => j !== i))} className="p-2 text-destructive">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setPilihan([...pilihan, ""])}
                    className="mt-2 text-sm text-primary hover:underline">+ Tambah Pilihan</button>
                  {errors.pilihan && <p className="text-xs text-destructive mt-1">{errors.pilihan}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">{editing ? "Simpan" : "Buat Voting"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Hapus Voting</h2>
            <p className="text-muted-foreground text-sm mb-5">Voting dan semua suara akan dihapus permanen. Lanjutkan?</p>
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
