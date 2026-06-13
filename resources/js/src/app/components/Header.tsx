import { useState } from "react";
import { Bell, Search, User, Megaphone, CheckCircle2, Menu } from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";

interface Notification {
  id: string;
  data: {
    judul?: string;
    pesan: string;
    link?: string;
    tipe: string;
  };
  read_at: string | null;
  created_at: string;
}

interface PageProps {
  auth: {
    user: {
      name: string;
      role_name: string;
      role_label: string;
      unreadNotifications: Notification[];
    };
  };
}

interface HeaderProps {
  userName: string;
  role: string;
  perumahan: string;
  onMenuClick?: () => void;
}

export function Header({ userName, role, perumahan, onMenuClick }: HeaderProps) {
  const { auth } = usePage<PageProps>().props;
  const notifications = auth.user.unreadNotifications || [];
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPengumumanModal, setShowPengumumanModal] = useState(false);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");

  const markAsRead = (id: string) => {
    router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
  };

  const markAllAsRead = () => {
    router.post('/notifications/read', {}, { preserveScroll: true });
    setShowDropdown(false);
  };

  const sendPengumuman = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/pengumuman', { judul, pesan }, {
      onSuccess: () => {
        setShowPengumumanModal(false);
        setJudul("");
        setPesan("");
      }
    });
  };

  // Adjust admin logic based on the user's role_name
  const isAdmin = auth.user.role_name === 'admin' || auth.user.role_name === 'pengurus';

  return (
    <div className="h-16 bg-card border-b border-border px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari warga, agenda, atau transaksi..."
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {isAdmin && (
          <button 
            onClick={() => setShowPengumumanModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            <Megaphone className="w-4 h-4" /> <span className="hidden sm:inline">Kirim Pengumuman</span>
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 hover:bg-muted rounded-lg transition-all"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
              <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="font-semibold text-sm">Notifikasi</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Belum ada notifikasi baru.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 border-b border-border hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-primary">
                          {notif.data.tipe === 'pengumuman' ? 'Pengumuman' : notif.data.tipe === 'agenda' ? 'Agenda' : 'Marketplace'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(notif.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {notif.data.judul && <div className="font-semibold text-sm">{notif.data.judul}</div>}
                      <div className="text-sm text-foreground mt-1 line-clamp-2">{notif.data.pesan}</div>
                      <div className="flex justify-end gap-2 mt-2">
                        {notif.data.link && (
                          <Link href={notif.data.link} className="text-xs text-primary hover:underline">
                            Lihat Detail
                          </Link>
                        )}
                        <button onClick={() => markAsRead(notif.id)} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <CheckCircle2 className="w-3 h-3" /> Tandai Dibaca
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-border">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{role} • {perumahan}</p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      </div>

      {showPengumumanModal && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 relative">
            <h2 className="text-xl font-bold mb-4">Kirim Pengumuman</h2>
            <form onSubmit={sendPengumuman}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Judul Pengumuman</label>
                <input 
                  type="text" 
                  value={judul} 
                  onChange={(e) => setJudul(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none" 
                  placeholder="Misal: Kerja Bakti Hari Minggu"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Pesan / Isi Pengumuman</label>
                <textarea 
                  rows={4} 
                  value={pesan} 
                  onChange={(e) => setPesan(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input-background focus:ring-2 focus:ring-primary focus:outline-none resize-none" 
                  placeholder="Tuliskan pesan lengkap untuk semua warga..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowPengumumanModal(false)} className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Megaphone className="w-4 h-4" /> Kirim Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
