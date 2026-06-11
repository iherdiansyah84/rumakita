import { StatCard } from "./StatCard";
import { Users, Wallet, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Building2 } from "lucide-react";

export function Dashboard() {
  const announcements = [
    { id: 1, title: "Gotong Royong Minggu Depan", date: "5 Mei 2026", type: "event" },
    { id: 2, title: "Iuran Bulan Mei Dibuka", date: "1 Mei 2026", type: "payment" },
    { id: 3, title: "Rapat RT Minggu Ini", date: "3 Mei 2026", type: "meeting" },
  ];

  const recentActivities = [
    { id: 1, user: "Budi Santoso", action: "Membayar iuran kebersihan", time: "2 jam lalu", status: "success" },
    { id: 2, user: "Siti Aminah", action: "Mengajukan surat domisili", time: "3 jam lalu", status: "pending" },
    { id: 3, user: "Ahmad Hidayat", action: "Voting kegiatan 17 Agustus", time: "5 jam lalu", status: "success" },
    { id: 4, user: "Dewi Lestari", action: "Upload foto kegiatan posyandu", time: "1 hari lalu", status: "success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di sistem kelola warga RumaKita</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Warga"
          value="1,247"
          icon={Users}
          trend={{ value: "12% dari bulan lalu", isPositive: true }}
          color="primary"
        />
        <StatCard
          title="Saldo Kas RT"
          value="Rp 45.2 Jt"
          icon={Wallet}
          trend={{ value: "8% dari bulan lalu", isPositive: true }}
          color="accent"
        />
        <StatCard
          title="Agenda Aktif"
          value="8"
          icon={Calendar}
          color="secondary"
        />
        <StatCard
          title="Iuran Terkumpul"
          value="87%"
          icon={TrendingUp}
          trend={{ value: "5% dari target", isPositive: true }}
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
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === "success" ? "bg-teal-500" : "bg-amber-500"}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Pengumuman</h2>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 bg-secondary/30 rounded-lg border border-secondary">
                <h3 className="text-sm font-medium text-foreground mb-1">{announcement.title}</h3>
                <p className="text-xs text-muted-foreground">{announcement.date}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Lihat Semua Pengumuman
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <Building2 className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Multi Perumahan</h3>
          <p className="text-sm opacity-90 mb-3">Kelola 5 perumahan dalam 1 sistem</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Kelola Perumahan
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <CheckCircle className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Gotong Royong</h3>
          <p className="text-sm opacity-90 mb-3">8 kegiatan bulan ini</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Lihat Kegiatan
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Clock className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Surat Digital</h3>
          <p className="text-sm opacity-90 mb-3">15 permohonan pending</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Proses Surat
          </button>
        </div>
      </div>
    </div>
  );
}
