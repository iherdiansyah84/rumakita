import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
  UserCog, Plus, Search, Pencil, Trash2, X,
  ShieldCheck, User as UserIcon, KeyRound, Mail,
} from "lucide-react";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "pengurus" | "warga";
  created_at: string;
};

type Stats = { total: number; pengurus: number; warga: number };

type Props = { users: UserRow[]; stats: Stats };

type PageProps = { auth: { user: { id: number } } };

const roleLabel: Record<string, string> = {
  pengurus: "Pengurus",
  warga:    "Warga",
};

const roleBadge: Record<string, string> = {
  pengurus: "bg-purple-100 text-purple-700",
  warga:    "bg-teal-100 text-teal-700",
};

const emptyForm = { name: "", email: "", role: "warga" as "pengurus" | "warga", password: "", password_confirmation: "" };

import { useAuth } from "../../../hooks/useRole";

export function UserModule({ users = [], stats }: Props) {
  const { auth } = usePage<PageProps>().props;
  const { isWarga } = useAuth();

  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState<"semua" | "pengurus" | "warga">("semua");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<UserRow | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [showPass, setShowPass]     = useState(false);

  // ── filter ─────────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "semua" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // ── helpers ────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowPass(false);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(u: UserRow) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: "", password_confirmation: "" });
    setShowPass(false);
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: Record<string, string> = {
      name:  form.name,
      email: form.email,
      role:  form.role,
    };
    if (form.password) {
      payload.password              = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    if (editing) {
      router.patch(`/users/${editing.id}`, payload, {
        onSuccess: () => setShowModal(false),
        onError:   (err) => setErrors(err as Record<string, string>),
      });
    } else {
      router.post("/users", payload, {
        onSuccess: () => setShowModal(false),
        onError:   (err) => setErrors(err as Record<string, string>),
      });
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    router.delete(`/users/${deleteTarget.id}`, {
      onSuccess: () => setDeleteTarget(null),
      onError:   (err) => {
        setDeleteTarget(null);
        alert(Object.values(err as Record<string, string>).join("\n"));
      },
    });
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Kelola Pengguna</h1>
          <p className="text-muted-foreground">Manajemen akun dan hak akses pengguna</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengguna
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <UserCog className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Total Pengguna</p>
          <p className="text-3xl font-semibold">{stats?.total ?? users.length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pengurus</p>
          <p className="text-3xl font-semibold text-foreground">{stats?.pengurus ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
            <UserIcon className="w-6 h-6 text-teal-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Warga</p>
          <p className="text-3xl font-semibold text-foreground">{stats?.warga ?? 0}</p>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-card rounded-xl border border-border">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          {(["semua", "pengurus", "warga"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filterRole === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {r === "semua" ? "Semua" : roleLabel[r]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 px-4 text-sm font-medium text-muted-foreground">Pengguna</th>
                <th className="py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="py-3 px-4 text-sm font-medium text-muted-foreground">Bergabung</th>
                <th className="py-3 px-4 text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    {search || filterRole !== "semua" ? "Tidak ada pengguna yang sesuai filter." : "Belum ada pengguna."}
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm bg-primary/10 text-primary">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        {u.id === auth.user.id && (
                          <p className="text-xs text-primary font-medium">Akun Anda</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      {u.email}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleBadge[u.role]}`}>
                      {u.role === "pengurus" ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{u.created_at}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => u.id !== auth.user.id && setDeleteTarget(u)}
                        disabled={u.id === auth.user.id}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.id === auth.user.id ? "Tidak dapat menghapus akun sendiri" : "Hapus"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
            Menampilkan {filtered.length} dari {users.length} pengguna
          </div>
        )}
      </div>

      {/* ── Modal Create / Edit ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">
                  {editing ? "Edit Pengguna" : "Tambah Pengguna"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editing ? `Mengedit akun ${editing.name}` : "Buat akun pengguna baru"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Nama Lengkap <span className="text-destructive">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  required
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="pengguna@email.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  required
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Role <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["warga", "pengurus"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      disabled={isWarga}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        form.role === r
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40"
                      } ${isWarga ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        r === "pengurus" ? "bg-purple-100" : "bg-teal-100"
                      }`}>
                        {r === "pengurus"
                          ? <ShieldCheck className="w-5 h-5 text-purple-600" />
                          : <UserIcon className="w-5 h-5 text-teal-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{roleLabel[r]}</p>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {r === "pengurus" ? "Akses penuh" : "Akses terbatas"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">
                    {editing ? "Password Baru" : "Password"}{!editing && <span className="text-destructive"> *</span>}
                  </label>
                  {editing && (
                    <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      {showPass ? "Sembunyikan" : "Ganti password"}
                    </button>
                  )}
                </div>

                {(!editing || showPass) && (
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={editing ? "Kosongkan jika tidak ingin mengubah" : "Min. 8 karakter"}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      required={!editing}
                    />
                    <input
                      type="password"
                      value={form.password_confirmation}
                      onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                      placeholder="Konfirmasi password"
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      required={!editing}
                    />
                  </div>
                )}
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  {editing ? "Simpan Perubahan" : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus ───────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm shadow-xl p-6">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-center mb-1">Hapus Pengguna</h2>
            <p className="text-sm text-muted-foreground text-center mb-1">
              Akun <span className="font-semibold text-foreground">{deleteTarget.name}</span> akan dihapus permanen.
            </p>
            <p className="text-xs text-muted-foreground text-center mb-6">
              Semua data terkait (diskusi, galeri, marketplace) ikut terhapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
