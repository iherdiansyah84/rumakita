import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "../../../Layouts/AppLayout";
import { useState } from "react";
import { Shield, Plus, Pencil, Trash2, Users, Check, X, ChevronDown, ChevronUp, Search } from "lucide-react";

type Permission = Record<string, string[]>;
type RoleData = {
  id: number; name: string; label: string; description: string | null;
  users_count: number; permissions: Permission; created_at: string;
};
type Props = {
  roles: RoleData[];
  modules: Record<string, string[]>;
  stats: { total_roles: number; total_users: number };
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard", perumahan: "Perumahan", warga: "Data Warga",
  keuangan: "Keuangan", forum: "Forum", galeri: "Galeri",
  voting: "Voting", agenda: "Agenda", marketplace: "Marketplace",
  laporan: "Laporan", users: "Kelola Pengguna", roles: "Kelola Role",
};
const ACTION_LABELS: Record<string, string> = {
  view: "Lihat", create: "Tambah", update: "Edit", delete: "Hapus",
  export: "Ekspor", like: "Like", comment: "Komentar", vote: "Vote",
};

function RoleFormDialog({ role, modules, onClose }: {
  role: RoleData | null; modules: Record<string, string[]>; onClose: () => void;
}) {
  const isEdit = !!role;
  const [form, setForm] = useState({
    name: role?.name ?? "", label: role?.label ?? "", description: role?.description ?? "",
    permissions: { ...Object.fromEntries(Object.keys(modules).map(m => [m, [] as string[]])), ...(role?.permissions ?? {}) } as Permission,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(modules).map(m => [m, true]))
  );

  const toggleAction = (mod: string, action: string) => {
    setForm(prev => {
      const current = prev.permissions[mod] ?? [];
      const next = current.includes(action) ? current.filter(a => a !== action) : [...current, action];
      return { ...prev, permissions: { ...prev.permissions, [mod]: next } };
    });
  };
  const toggleModule = (mod: string) => {
    setForm(prev => {
      const allActions = modules[mod];
      const current = prev.permissions[mod] ?? [];
      const allSelected = allActions.every(a => current.includes(a));
      return { ...prev, permissions: { ...prev.permissions, [mod]: allSelected ? [] : [...allActions] } };
    });
  };
  const toggleAll = (select: boolean) => {
    setForm(prev => ({
      ...prev,
      permissions: Object.fromEntries(Object.entries(modules).map(([m, actions]) => [m, select ? [...actions] : []])),
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErrors({});
    const url = isEdit ? `/pengaturan/roles/${role!.id}` : "/pengaturan/roles";
    const method = isEdit ? "patch" : "post";
    router[method](url, form as any, {
      onSuccess: () => onClose(),
      onError: (errs: any) => { setErrors(errs); setLoading(false); },
      onFinish: () => setLoading(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {isEdit ? `Edit Role: ${role!.label}` : "Buat Role Baru"}
          </h2>
        </div>
        <form onSubmit={submit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nama Sistem <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  disabled={isEdit} placeholder="contoh: supervisor"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 transition-all" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                <p className="text-xs text-muted-foreground mt-1">Huruf kecil & underscore saja</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Label <span className="text-red-500">*</span></label>
                <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  placeholder="contoh: Supervisor"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Deskripsi</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Deskripsi singkat tentang role ini"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
            </div>

            {/* Permission Matrix */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-foreground">Hak Akses (Permission Matrix)</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => toggleAll(true)} className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-medium transition-colors">Pilih Semua</button>
                  <button type="button" onClick={() => toggleAll(false)} className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 font-medium transition-colors">Hapus Semua</button>
                </div>
              </div>
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {Object.entries(modules).map(([mod, actions]) => {
                  const selected = form.permissions[mod] ?? [];
                  const allSelected = actions.every(a => selected.includes(a));
                  const someSelected = selected.length > 0 && !allSelected;
                  const isExpanded = expandedModules[mod] !== false;
                  return (
                    <div key={mod} className="bg-card">
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedModules(p => ({ ...p, [mod]: !isExpanded }))}>
                        <button type="button" onClick={e => { e.stopPropagation(); toggleModule(mod); }}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                            allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/30 border-primary" : "border-muted-foreground/30"
                          }`}>
                          {(allSelected || someSelected) && <Check className="w-3 h-3 text-primary-foreground" />}
                        </button>
                        <span className="text-sm font-semibold text-foreground flex-1">{MODULE_LABELS[mod] || mod}</span>
                        <span className="text-xs text-muted-foreground mr-2">{selected.length}/{actions.length}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 ml-8">
                          {actions.map(action => {
                            const isChecked = selected.includes(action);
                            return (
                              <button key={action} type="button" onClick={() => toggleAction(mod, action)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isChecked
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}>
                                {isChecked ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-40" />}
                                {ACTION_LABELS[action] || action}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.permissions && <p className="text-red-500 text-xs mt-2">{errors.permissions}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Batal</button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm">
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDialog({ role, onClose }: { role: RoleData; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = () => {
    setLoading(true);
    router.delete(`/pengaturan/roles/${role.id}`, {
      onSuccess: () => onClose(),
      onError: (errs: any) => { setError(errs.delete || "Gagal menghapus role."); setLoading(false); },
      onFinish: () => setLoading(false),
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Hapus Role</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Apakah Anda yakin ingin menghapus role <strong className="text-foreground">{role.label}</strong>?</p>
        {role.users_count > 0 && (
          <p className="text-sm text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg mt-3">⚠️ Role ini masih digunakan oleh {role.users_count} pengguna.</p>
        )}
        {error && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg mt-3">{error}</p>}
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Batal</button>
          <button onClick={submit} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RolesIndex({ roles, modules, stats }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState<RoleData | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleData | null>(null);
  const [search, setSearch] = useState("");
  const { auth } = usePage<{ auth: { permissions: Record<string, boolean> } }>().props;
  const can = (m: string, a: string) => auth?.permissions?.[`${m}.${a}`] === true;

  const filtered = roles.filter(r =>
    r.label.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <Head title="Kelola Role - Pengaturan - RumaKita" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" /> Kelola Role & Hak Akses
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Atur hak akses setiap role hingga level tombol</p>
          </div>
          {can("roles", "create") && (
            <button onClick={() => { setEditRole(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md text-sm font-medium">
              <Plus className="w-4 h-4" /> Buat Role Baru
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total_roles}</p>
              <p className="text-sm text-muted-foreground">Total Role</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total_users}</p>
              <p className="text-sm text-muted-foreground">Total Pengguna</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(role => (
            <div key={role.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{role.label}</h3>
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded mt-1 inline-block">{role.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                    <Users className="w-3 h-3" /> {role.users_count}
                  </span>
                </div>
              </div>
              {role.description && <p className="text-sm text-muted-foreground mb-3">{role.description}</p>}
              
              {/* Permission summary badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {Object.entries(role.permissions).map(([mod, actions]) => (
                  <span key={mod} className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">
                    {MODULE_LABELS[mod] || mod} ({(actions as string[]).length})
                  </span>
                ))}
                {Object.keys(role.permissions).length === 0 && (
                  <span className="text-xs text-muted-foreground italic">Tidak ada akses</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{role.created_at}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {can("roles", "update") && (
                    <button onClick={() => { setEditRole(role); setShowForm(true); }}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {can("roles", "delete") && !["pengurus", "warga"].includes(role.name) && (
                    <button onClick={() => setDeleteRole(role)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada role ditemukan</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showForm && <RoleFormDialog role={editRole} modules={modules} onClose={() => setShowForm(false)} />}
      {deleteRole && <DeleteDialog role={deleteRole} onClose={() => setDeleteRole(null)} />}
    </AppLayout>
  );
}
