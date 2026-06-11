import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { ShoppingBag, ArrowLeft, Clock, MapPin, MessageSquare, ChevronLeft, ChevronRight, Heart } from "lucide-react";

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

type PageProps = { 
  auth: { user: { id: number; name: string } };
  errors: Record<string, string>;
};

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

export default function Show({ marketplace }: { marketplace: Produk }) {
  const { auth, errors } = usePage<PageProps>().props;
  const [currentImg, setCurrentImg] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pesan, setPesan] = useState("");
  const isOwner = auth.user.id === marketplace.user_id;
  const isSold = marketplace.status === 'sold';

  function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    router.post(`/marketplace/${marketplace.id}/pesan`, { pesan }, {
      onSuccess: () => setShowOrderModal(false),
    });
  }

  function nextImg() {
    if (marketplace.gambar && currentImg < marketplace.gambar.length - 1) {
      setCurrentImg(prev => prev + 1);
    }
  }

  function prevImg() {
    if (marketplace.gambar && currentImg > 0) {
      setCurrentImg(prev => prev - 1);
    }
  }

  return (
    <AppLayout>
      <Head title={`${marketplace.judul} - Marketplace`} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Marketplace
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Bagian Gambar */}
          <div className="relative h-64 md:h-auto bg-muted min-h-[400px] flex items-center justify-center">
            {marketplace.gambar && marketplace.gambar.length > 0 ? (
              <>
                <img src={marketplace.gambar[currentImg]} alt={marketplace.judul} className="absolute inset-0 w-full h-full object-cover" />
                {marketplace.gambar.length > 1 && (
                  <>
                    <button onClick={prevImg} disabled={currentImg === 0} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-30">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextImg} disabled={currentImg === marketplace.gambar.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-30">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                      {currentImg + 1} / {marketplace.gambar.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <ShoppingBag className="w-24 h-24 text-muted-foreground opacity-30" />
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-md">
                {marketplace.tipe_iklan}
              </span>
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full shadow-md">
                {marketplace.kategori}
              </span>
            </div>
            {isSold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="text-white text-3xl font-bold tracking-widest rotate-[-15deg] border-4 border-white px-6 py-2 rounded-xl">TERJUAL</span>
              </div>
            )}
          </div>

          {/* Bagian Detail */}
          <div className="p-6 md:p-8 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{marketplace.judul}</h1>
            <p className="text-3xl font-bold text-primary mb-6">{formatRp(marketplace.harga)}</p>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span>Dibuat {new Date(marketplace.created_at).toLocaleDateString("id-ID")}</span>
              </div>
              <button 
                onClick={() => router.post(`/marketplace/${marketplace.id}/like`, {}, { preserveScroll: true })}
                className={`flex items-center gap-2 hover:text-red-500 transition-colors ${marketplace.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`w-5 h-5 ${marketplace.is_liked ? 'fill-current' : ''}`} />
                <span>{marketplace.likes_count || 0} Suka</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-lg">
                {marketplace.penjual.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Penjual</p>
                <p className="font-semibold text-foreground">{marketplace.penjual}</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Deskripsi Produk</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                  {marketplace.deskripsi || "Tidak ada deskripsi."}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                <Clock className="w-4 h-4" /> Diposting {timeAgo(marketplace.created_at)}
              </div>
            </div>

            <div className="pt-8 mt-auto">
              {isOwner ? (
                <div className="w-full text-center p-3 bg-muted text-muted-foreground rounded-xl text-sm font-medium">
                  Ini adalah iklan Anda sendiri
                </div>
              ) : isSold ? (
                <div className="w-full text-center p-3 bg-destructive/10 text-destructive rounded-xl text-sm font-semibold">
                  Maaf, barang sudah tidak tersedia (Terjual/Tersewa).
                </div>
              ) : (
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Ajukan Pesanan ({marketplace.tipe_iklan})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-foreground">Ajukan Pesanan</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Anda akan memesan <strong>{marketplace.judul}</strong> dari <strong>{marketplace.penjual}</strong> seharga {formatRp(marketplace.harga)}.
            </p>
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pesan untuk penjual (Opsional)</label>
                <textarea
                  rows={4}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Contoh: Halo, apakah barangnya masih bisa ditawar? Atau kapan bisa COD?"
                  className={`w-full px-4 py-3 rounded-xl border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary resize-none ${errors.pesan ? 'border-destructive focus:ring-destructive' : 'border-border'}`}
                />
                {errors.pesan && <p className="text-destructive text-sm mt-1">{errors.pesan}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-md">
                  Kirim Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
