import { Head, Link, router, usePage } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { ArrowLeft, Clock, CheckCircle, XCircle, Package, ShoppingBag, MessageCircle, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Pesanan = {
  id: number;
  marketplace_id: number;
  marketplace_judul: string;
  marketplace_gambar: string | null;
  marketplace_harga: number;
  marketplace_tipe: string;
  pembeli: string | null;
  penjual: string | null;
  pesan: string | null;
  status: "menunggu" | "diproses" | "ditolak" | "selesai" | "dibatalkan";
  has_unread_messages?: boolean;
  created_at: string;
  messages?: { id: number; user_id: number; pengirim: string; pesan: string; created_at: string }[];
};

type Props = {
  pesananMasuk: Pesanan[];
  pesananSaya: Pesanan[];
};

function formatRp(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} hari lalu`;
  return "Hari ini";
}

function StatusBadge({ status }: { status: Pesanan["status"] }) {
  const colors = {
    menunggu: "bg-yellow-100 text-yellow-800 border-yellow-200",
    diproses: "bg-blue-100 text-blue-800 border-blue-200",
    ditolak: "bg-red-100 text-red-800 border-red-200",
    dibatalkan: "bg-gray-100 text-gray-800 border-gray-200",
    selesai: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${colors[status]} uppercase tracking-wider`}>
      {status}
    </span>
  );
}

export default function PesananMarketplace({ pesananMasuk = [], pesananSaya = [] }: Props) {
  const { auth } = usePage<any>().props;
  const [activeTab, setActiveTab] = useState<"masuk" | "saya">("saya");
  const [chatPesanan, setChatPesanan] = useState<Pesanan | null>(null);
  const [chatMsg, setChatMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatPesanan) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatPesanan?.messages]);

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPesanan || !chatMsg.trim()) return;
    router.post(`/marketplace/pesanan/${chatPesanan.id}/chat`, { pesan: chatMsg }, {
      preserveScroll: true,
      onSuccess: () => {
        setChatMsg("");
      }
    });
  };

  const openChat = (p: Pesanan) => {
    setChatPesanan(p);
    if (p.has_unread_messages) {
      router.post(`/marketplace/pesanan/${p.id}/read-chat`, {}, { preserveScroll: true });
    }
  };

  useEffect(() => {
    if (chatPesanan) {
      const updated = [...pesananMasuk, ...pesananSaya].find(p => p.id === chatPesanan.id);
      if (updated) setChatPesanan(updated);
    }
  }, [pesananMasuk, pesananSaya]);

  function updateStatus(id: number, status: Pesanan["status"]) {
    if (confirm(`Anda yakin ingin mengubah status pesanan ini menjadi ${status.toUpperCase()}?`)) {
      router.patch(`/marketplace/pesanan/${id}`, { status }, { preserveScroll: true });
    }
  }

  function PesananCard({ p, isMasuk }: { p: Pesanan; isMasuk: boolean }) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
        <div className="w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          {p.marketplace_gambar ? (
            <img src={p.marketplace_gambar} alt={p.marketplace_judul} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <Link href={`/marketplace/${p.marketplace_id}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                {p.marketplace_judul}
              </Link>
              <div className="text-sm font-semibold text-primary">{formatRp(p.marketplace_harga)}</div>
            </div>
            <StatusBadge status={p.status} />
          </div>
          
          <div className="text-sm text-muted-foreground mt-1 mb-3 bg-muted/30 p-3 rounded-lg border border-border/50">
            <p><span className="font-medium text-foreground">{isMasuk ? "Pembeli" : "Penjual"}:</span> {isMasuk ? p.pembeli : p.penjual}</p>
            {p.pesan && <p className="mt-1"><span className="font-medium text-foreground">Pesan:</span> "{p.pesan}"</p>}
            <p className="mt-1 flex items-center gap-1 text-xs opacity-70"><Clock className="w-3 h-3" /> {timeAgo(p.created_at)}</p>
          </div>

          <div className="flex gap-2 w-full mt-3">
            <button onClick={() => openChat(p)} className="relative flex-1 py-1.5 px-3 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors text-xs font-medium flex items-center justify-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> Chat
              {p.has_unread_messages && (
                <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>
            {isMasuk ? (
              <>
                {p.status === 'menunggu' && (
                  <>
                    <button onClick={() => updateStatus(p.id, 'diproses')} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">Terima</button>
                    <button onClick={() => updateStatus(p.id, 'ditolak')} className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20">Tolak</button>
                  </>
                )}
                {p.status === 'diproses' && (
                  <button onClick={() => updateStatus(p.id, 'selesai')} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Selesaikan</button>
                )}
              </>
            ) : (
              <>
                {(p.status === 'menunggu' || p.status === 'diproses') && (
                  <button onClick={() => updateStatus(p.id, 'dibatalkan')} className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20">Batalkan</button>
                )}
                {p.status === 'diproses' && (
                  <button onClick={() => updateStatus(p.id, 'selesai')} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Diterima</button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <Head title="Pesanan Marketplace" />
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Marketplace
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Transaksi Warga</h1>
          <p className="text-muted-foreground">Kelola pesanan barang yang Anda jual atau beli.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border pb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Pesanan Masuk (Jualan Saya)
            </h2>
            {pesananMasuk.length === 0 ? (
              <div className="text-center p-8 bg-muted/30 border border-dashed border-border rounded-xl text-muted-foreground">
                Belum ada pesanan yang masuk.
              </div>
            ) : (
              <div className="space-y-4">
                {pesananMasuk.map(p => <PesananCard key={p.id} p={p} isMasuk={true} />)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border pb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-secondary" /> Pesanan Saya (Pembelian)
            </h2>
            {pesananSaya.length === 0 ? (
              <div className="text-center p-8 bg-muted/30 border border-dashed border-border rounded-xl text-muted-foreground">
                Anda belum memesan barang apapun.
              </div>
            ) : (
              <div className="space-y-4">
                {pesananSaya.map(p => <PesananCard key={p.id} p={p} isMasuk={false} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {chatPesanan && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border flex flex-col h-[600px] max-h-[90vh]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{chatPesanan.marketplace_judul}</h3>
                <p className="text-xs text-muted-foreground">
                  Percakapan dengan {activeTab === 'masuk' ? chatPesanan.pembeli : chatPesanan.penjual}
                </p>
              </div>
              <button onClick={() => setChatPesanan(null)} className="p-2 hover:bg-muted rounded-full">
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatPesanan.messages?.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm my-10">
                  Belum ada pesan. Sapa {activeTab === 'masuk' ? 'pembeli' : 'penjual'} sekarang!
                </div>
              ) : (
                chatPesanan.messages?.map((msg) => {
                  const isMe = msg.user_id === auth.user.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-muted-foreground mb-1 mx-1">{msg.pengirim} • {new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                      <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.pesan}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <form onSubmit={sendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 bg-input-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={!chatMsg.trim()} className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
