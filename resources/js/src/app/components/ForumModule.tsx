import { useState, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { MessageSquare, MessageCircle, Send, X, Pencil, Trash2, Lock, Unlock, Image as ImageIcon } from "lucide-react";

type ReactionSummary = {
  counts: Record<string, number>;
  user_reaction: string | null;
  total: number;
};

type Komentar = {
  id: number;
  parent_id: number | null;
  user_id: number;
  user: string;
  konten: string;
  created_at: string;
  reactions: ReactionSummary;
  replies?: Komentar[];
};

type Diskusi = {
  id: number;
  user_id: number;
  user: string;
  judul: string;
  konten: string;
  kategori: string;
  status: 'open' | 'closed';
  lampiran?: string[];
  reactions: ReactionSummary;
  komentar: Komentar[];
  komentar_count: number;
  created_at: string;
};

type PageProps = { auth: { user: { id: number; name: string } } };

type Props = { diskusi: Diskusi[] };

const KATEGORI = ["Keamanan", "Kesehatan", "Infrastruktur", "Sosial", "Lainnya"];

const kategoriColor: Record<string, string> = {
  Keamanan:       "bg-red-100 text-red-700",
  Kesehatan:      "bg-green-100 text-green-700",
  Infrastruktur:  "bg-blue-100 text-blue-700",
  Sosial:         "bg-purple-100 text-purple-700",
  Lainnya:        "bg-gray-100 text-gray-700",
};

type FormState = { judul: string; konten: string; kategori: string; lampiran: FileList | null };
const emptyForm: FormState = { judul: "", konten: "", kategori: "Lainnya", lampiran: null };

const EMOJIS = [
  { type: 'like', icon: '👍', label: 'Suka' },
  { type: 'love', icon: '❤️', label: 'Super' },
  { type: 'haha', icon: '😂', label: 'Haha' },
  { type: 'wow', icon: '😮', label: 'Wow' },
  { type: 'sad', icon: '😢', label: 'Sedih' },
  { type: 'angry', icon: '😡', label: 'Marah' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Baru saja";
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function ReactionButton({ type, id, reactions }: { type: 'diskusi' | 'komentar', id: number, reactions: ReactionSummary }) {
  const [showPopover, setShowPopover] = useState(false);
  
  const handleReact = (reactionType: string) => {
    router.post('/forum/reaction', { type: reactionType, reactionable_type: type, reactionable_id: id }, { preserveScroll: true });
    setShowPopover(false);
  };

  const userReaction = EMOJIS.find(e => e.type === reactions.user_reaction);
  const activeIcon = userReaction ? userReaction.icon : '👍';
  const activeLabel = userReaction ? userReaction.label : 'Suka';
  const activeClass = userReaction ? 'text-primary font-semibold' : 'text-muted-foreground';

  return (
    <div className="relative inline-block" onMouseLeave={() => setShowPopover(false)}>
      <button 
        onMouseEnter={() => setShowPopover(true)}
        onClick={() => handleReact(userReaction ? userReaction.type : 'like')}
        className={`flex items-center gap-1.5 text-sm hover:bg-muted px-2 py-1 rounded transition-colors ${activeClass}`}
      >
        <span>{activeIcon}</span>
        <span className="hidden sm:inline">{userReaction ? activeLabel : 'Suka'}</span>
        {reactions.total > 0 && <span className="ml-1 px-1.5 py-0.5 bg-muted rounded-full text-xs text-foreground">{reactions.total}</span>}
      </button>

      {showPopover && (
        <div className="absolute bottom-full left-0 pb-1 z-10">
          <div className="flex gap-1 bg-card border border-border shadow-lg rounded-full p-1.5">
            {EMOJIS.map(emo => (
              <button
                key={emo.type}
                onClick={(e) => { e.stopPropagation(); handleReact(emo.type); }}
                className="text-2xl hover:scale-125 transition-transform origin-bottom px-1"
                title={emo.label}
              >
                {emo.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MediaRenderer({ urls }: { urls: string[] }) {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="flex gap-2 flex-wrap mt-3">
      {urls.map(url => {
        const isVideo = url.match(/\.(mp4|mov)$/i);
        if (isVideo) {
          return <video key={url} src={url} controls className="max-w-full rounded-lg max-h-64" />;
        }
        return <img key={url} src={url} alt="Lampiran" className="max-w-full rounded-lg max-h-64 object-cover border border-border" />;
      })}
    </div>
  );
}

function CommentThread({ 
  comments, 
  diskusiId, 
  depth = 0, 
  activeReplyId, 
  onReplyClick, 
  onSendReply,
  replyInput,
  setReplyInput,
  isDiskusiOpen
}: { 
  comments: Komentar[], 
  diskusiId: number, 
  depth?: number,
  activeReplyId: number | null,
  onReplyClick: (kId: number) => void,
  onSendReply: (parentId: number) => void,
  replyInput: string,
  setReplyInput: (val: string) => void,
  isDiskusiOpen: boolean
}) {
  return (
    <div className="space-y-4">
      {comments.map(k => (
        <div key={k.id} className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 text-secondary-foreground text-xs font-bold">
              {k.user.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="bg-muted/30 border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{k.user}</span>
                  <span className="text-xs text-muted-foreground">• {timeAgo(k.created_at)}</span>
                </div>
                <p className="text-sm text-foreground/90">{k.konten}</p>
              </div>
              <div className="mt-1 flex items-center gap-4 ml-2">
                <ReactionButton type="komentar" id={k.id} reactions={k.reactions} />
                {isDiskusiOpen && (
                  <button onClick={() => onReplyClick(k.id)} className="text-xs text-muted-foreground hover:text-primary font-medium">Balas</button>
                )}
              </div>

              {/* Reply Input */}
              {activeReplyId === k.id && isDiskusiOpen && (
                <div className="flex gap-2 items-end mt-2">
                  <div className="flex-1">
                    <textarea 
                      rows={2}
                      value={replyInput} 
                      onChange={e => setReplyInput(e.target.value)} 
                      className="w-full border border-border bg-input-background rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
                      placeholder={`Balas ${k.user}...`} 
                    />
                  </div>
                  <button 
                    onClick={() => onSendReply(k.id)} 
                    className="px-4 py-3 h-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Recursive Replies */}
          {k.replies && k.replies.length > 0 && (
            <div className="ml-8 border-l-2 border-border/50 pl-4 mt-2">
              <CommentThread 
                comments={k.replies} 
                diskusiId={diskusiId} 
                depth={depth + 1} 
                activeReplyId={activeReplyId}
                onReplyClick={onReplyClick}
                onSendReply={onSendReply}
                replyInput={replyInput}
                setReplyInput={setReplyInput}
                isDiskusiOpen={isDiskusiOpen}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ForumModule({ diskusi = [] }: Props) {
  const { auth } = usePage<PageProps>().props;
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Diskusi | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  
  // State for main comments
  const [komentarInputs, setKomentarInputs] = useState<Record<number, string>>({});
  
  // State for nested replies
  const [activeReplyId, setActiveReplyId] = useState<Record<number, number | null>>({});
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filterKategori === "Semua"
    ? diskusi
    : diskusi.filter((d) => d.kategori === filterKategori);

  const kategoriBaru: Record<string, number> = { Semua: diskusi.length };
  KATEGORI.forEach((k) => { kategoriBaru[k] = diskusi.filter((d) => d.kategori === k).length; });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(d: Diskusi) {
    setEditing(d);
    setForm({ judul: d.judul, konten: d.konten, kategori: d.kategori, lampiran: null });
    setErrors({});
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("judul", form.judul);
    formData.append("konten", form.konten);
    formData.append("kategori", form.kategori);
    
    if (form.lampiran) {
      Array.from(form.lampiran).forEach((file, index) => {
        formData.append(`lampiran[${index}]`, file);
      });
    }

    if (editing) {
      formData.append("_method", "patch");
      router.post(`/forum/${editing.id}`, formData, {
        forceFormData: true,
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    } else {
      router.post("/forum", formData, {
        forceFormData: true,
        onSuccess: () => setShowModal(false),
        onError: (err) => setErrors(err as Record<string, string>),
      });
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    router.delete(`/forum/${deleteId}`, { onSuccess: () => setDeleteId(null) });
  }

  function toggleStatus(id: number) {
    router.post(`/forum/${id}/status`, {}, { preserveScroll: true });
  }

  function toggleComments(id: number) {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function sendKomentar(diskusiId: number, parentId: number | null = null, text: string) {
    if (!text || !text.trim()) return;
    router.post(`/forum/${diskusiId}/komentar`, { konten: text, parent_id: parentId }, {
      preserveScroll: true,
      onSuccess: () => {
        if (parentId) {
          setReplyInputs(prev => ({ ...prev, [diskusiId]: "" }));
          setActiveReplyId(prev => ({ ...prev, [diskusiId]: null }));
        } else {
          setKomentarInputs(prev => ({ ...prev, [diskusiId]: "" }));
        }
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Forum Diskusi</h1>
          <p className="text-muted-foreground">Ruang diskusi terbuka untuk semua warga</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">Buat Diskusi Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm sticky top-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Kategori</h3>
            <div className="space-y-2">
              {["Semua", ...KATEGORI].map((k) => (
                <button
                  key={k}
                  onClick={() => setFilterKategori(k)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    filterKategori === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className="text-sm">{k}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${filterKategori === k ? "bg-white/20" : "bg-muted"}`}>
                    {kategoriBaru[k] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {filtered.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              Belum ada diskusi di kategori ini. Mulai yang pertama!
            </div>
          )}
          {filtered.map((d) => (
            <div key={d.id} className="bg-card rounded-xl p-5 border border-border shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium text-lg">{d.user.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-base">{d.user}</span>
                      <span className="text-xs text-muted-foreground">• {timeAgo(d.created_at)}</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      {(auth.user.id === d.user_id) && (
                        <>
                          <button onClick={() => toggleStatus(d.id)} className="p-1.5 text-muted-foreground hover:text-amber-600" title={d.status === 'open' ? 'Tutup Diskusi' : 'Buka Diskusi'}>
                            {d.status === 'open' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEdit(d)} className="p-1.5 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${kategoriColor[d.kategori] ?? "bg-gray-100 text-gray-700"}`}>
                      {d.kategori}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${d.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {d.status === 'open' ? 'Terbuka' : 'Ditutup'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">{d.judul}</h2>
                  <p className="text-foreground/90 whitespace-pre-line text-sm leading-relaxed">{d.konten}</p>
                  
                  <MediaRenderer urls={d.lampiran || []} />
                  
                  {/* Action Bar */}
                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
                    <ReactionButton type="diskusi" id={d.id} reactions={d.reactions} />
                    <button 
                      onClick={() => toggleComments(d.id)} 
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary px-2 py-1 rounded transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{d.komentar_count} Komentar</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[d.id] && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <CommentThread 
                        comments={d.komentar} 
                        diskusiId={d.id} 
                        activeReplyId={activeReplyId[d.id] ?? null}
                        onReplyClick={(kId) => setActiveReplyId(prev => ({ ...prev, [d.id]: kId }))}
                        onSendReply={(parentId) => sendKomentar(d.id, parentId, replyInputs[d.id] || '')}
                        replyInput={replyInputs[d.id] || ''}
                        setReplyInput={(val) => setReplyInputs(prev => ({ ...prev, [d.id]: val }))}
                        isDiskusiOpen={d.status === 'open'}
                      />

                      {d.status === 'open' ? (
                        <div className="flex gap-2 items-end mt-4 pt-4 border-t border-border">
                          <div className="flex-1">
                            <textarea 
                              rows={2}
                              value={komentarInputs[d.id] || ''} 
                              onChange={e => setKomentarInputs({...komentarInputs, [d.id]: e.target.value})} 
                              className="w-full border border-border bg-input-background rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
                              placeholder="Tulis komentar utama..." 
                            />
                          </div>
                          <button 
                            onClick={() => sendKomentar(d.id, null, komentarInputs[d.id] || '')} 
                            className="px-4 py-3 h-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="bg-destructive/10 text-destructive text-sm font-semibold rounded-lg p-3 text-center mt-4">
                          Diskusi ini telah ditutup oleh pembuatnya. Anda tidak dapat menambahkan komentar baru.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-xl font-bold">{editing ? "Edit Diskusi" : "Buat Diskusi Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground bg-muted p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Judul Diskusi</label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required placeholder="Contoh: Jadwal ronda malam..." />
                {errors.judul && <p className="text-xs text-destructive mt-1">{errors.judul}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Kategori</label>
                <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary">
                  {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Isi Diskusi</label>
                <textarea rows={5} value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary resize-none" required placeholder="Sampaikan pendapat atau pertanyaan Anda..." />
                {errors.konten && <p className="text-xs text-destructive mt-1">{errors.konten}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Lampirkan Gambar/Video (Opsional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <ImageIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Klik untuk memilih file (Maks 20MB)</p>
                  {form.lampiran && form.lampiran.length > 0 && (
                    <div className="mt-2 text-xs font-semibold text-primary">
                      {form.lampiran.length} file dipilih
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  accept="image/*,video/mp4,video/quicktime" 
                  onChange={e => setForm({ ...form, lampiran: e.target.files })} 
                  className="hidden" 
                />
                {errors['lampiran.0'] && <p className="text-xs text-destructive mt-1">{errors['lampiran.0']}</p>}
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-border hover:bg-muted font-medium transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-md transition-colors">{editing ? "Simpan Perubahan" : "Posting Diskusi"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Hapus Diskusi?</h2>
            <p className="text-muted-foreground text-sm mb-6">Diskusi ini beserta seluruh komentarnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border border-border hover:bg-muted font-medium transition-colors">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 shadow-md transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
