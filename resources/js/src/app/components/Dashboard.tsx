import { StatCard } from "./StatCard";
import { Users, Wallet, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Building2 } from "lucide-react";

interface DashboardProps {
  stats: {
    total_warga: number;
    saldo_kas: number;
    agenda_aktif: number;
    surat_pending: number;
    kegiatan_bulan_ini: number;
    total_perumahan: number;
  };
  pengumuman: any[];
  recentActivities: any[];
}

export function Dashboard({ stats, pengumuman, recentActivities }: DashboardProps) {
  // Format rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di sistem kelola warga RumaKita</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Warga"
          value={stats?.total_warga?.toString() || "0"}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Saldo Kas RT"
          value={formatRupiah(stats?.saldo_kas || 0)}
          icon={Wallet}
          color="accent"
        />
        <StatCard
          title="Agenda Aktif"
          value={stats?.agenda_aktif?.toString() || "0"}
          icon={Calendar}
          color="secondary"
        />
        <StatCard
          title="Surat Pending"
          value={stats?.surat_pending?.toString() || "0"}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Aktivitas Terbaru</h2>
            <button className="text-sm text-primary hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === "success" ? "bg-teal-500" : (activity.status === "pending" ? "bg-amber-500" : "bg-red-500")}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            )) : (
              <div className="p-3 text-sm text-muted-foreground text-center">Belum ada aktivitas.</div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Pengumuman</h2>
          </div>
          <div className="space-y-3">
            {pengumuman && pengumuman.length > 0 ? pengumuman.map((announcement) => (
              <div key={announcement.id} className="p-4 bg-secondary/30 rounded-lg border border-secondary">
                <h3 className="text-sm font-medium text-foreground mb-1">{announcement.title}</h3>
                <p className="text-xs text-muted-foreground">{announcement.date}</p>
              </div>
            )) : (
              <div className="p-4 bg-muted/30 rounded-lg border border-border text-center text-sm text-muted-foreground">Belum ada pengumuman.</div>
            )}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Lihat Semua Pengumuman
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <Building2 className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Total Perumahan</h3>
          <p className="text-sm opacity-90 mb-3">{stats?.total_perumahan || 1} Perumahan terdaftar</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Lihat Detail
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <CheckCircle className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Kegiatan Bulan Ini</h3>
          <p className="text-sm opacity-90 mb-3">{stats?.kegiatan_bulan_ini || 0} kegiatan terjadwal</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Lihat Agenda
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Clock className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Surat Masuk</h3>
          <p className="text-sm opacity-90 mb-3">{stats?.surat_pending || 0} permohonan pending</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Proses Surat
          </button>
        </div>
      </div>
    </div>
  );
}
