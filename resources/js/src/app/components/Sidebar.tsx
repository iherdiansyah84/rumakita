import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  Home, Building2, Users, Wallet, MessageSquare,
  Settings, BarChart3, Vote, ShoppingBag, Image, Calendar,
  ChevronLeft, ChevronRight, ChevronDown, LogOut, UserCog, Shield, User, FileText
} from "lucide-react";
import { useAuth } from "../../../hooks/useRole";

type Module = {
  id: string;
  href: string;
  icon: React.ElementType;
  label: string;
  permission?: string; // "module.action" format
};

const modules: Module[] = [
  { id: "dashboard",    href: "/dashboard",    icon: Home,          label: "Dashboard",     permission: "dashboard.view" },
  { id: "perumahan",    href: "/perumahan",    icon: Building2,     label: "Perumahan",     permission: "perumahan.view" },
  { id: "warga",        href: "/warga",        icon: Users,         label: "Data Warga",    permission: "warga.view" },
  { id: "keuangan",     href: "/keuangan",     icon: Wallet,        label: "Keuangan",      permission: "keuangan.view" },
  { id: "tagihan",      href: "/tagihan",      icon: Users,         label: "Tagihan Bulanan", permission: "tagihan.view" },
  { id: "pembayaran",   href: "/pembayaran-iuran", icon: Wallet,    label: "Pembayaran Iuran", permission: "pembayaran.view" },
  { id: "forum",        href: "/forum",        icon: MessageSquare, label: "Forum",         permission: "forum.view" },
  { id: "marketplace",  href: "/marketplace",  icon: ShoppingBag,   label: "Marketplace",   permission: "marketplace.view" },
  { id: "galeri",       href: "/galeri",       icon: Image,         label: "Galeri",        permission: "galeri.view" },
  { id: "voting",       href: "/voting",       icon: Vote,          label: "Voting",        permission: "voting.view" },
  { id: "agenda",       href: "/agenda",       icon: Calendar,      label: "Agenda",        permission: "agenda.view" },
  { id: "surat",        href: "/surat",        icon: FileText,      label: "Surat Digital", permission: "surat.view" },
  { id: "laporan",      href: "/laporan",      icon: BarChart3,     label: "Laporan",       permission: "laporan.view" },
];

const pengaturanItems: Module[] = [
  { id: "profile",   href: "/profile",           icon: User,    label: "Profil" },
  { id: "users",     href: "/users",             icon: UserCog, label: "Kelola Pengguna", permission: "users.view" },
  { id: "roles",     href: "/pengaturan/roles",  icon: Shield,  label: "Kelola Role",     permission: "roles.view" },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(false);
  const { url } = usePage();
  const { can, roleLabel } = useAuth();

  const visibleModules = modules.filter((m) => !m.permission || can(...m.permission.split(".") as [string, string]));
  const visiblePengaturan = pengaturanItems.filter((m) => !m.permission || can(...m.permission.split(".") as [string, string]));

  // Auto-open pengaturan submenu if current URL matches
  const isPengaturanActive = pengaturanItems.some(m => url === m.href || url.startsWith(m.href + "/"));
  if (isPengaturanActive && !isPengaturanOpen && !isCollapsed) {
    // Use setTimeout to avoid setState during render
    setTimeout(() => setIsPengaturanOpen(true), 0);
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}
      
      {/* Sidebar Container */}
      <div 
        className={`bg-card border-r border-border h-screen flex flex-col transition-transform duration-300 fixed md:relative z-50 md:z-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-8 bg-primary text-primary-foreground p-1 rounded-full shadow-md z-10 hover:bg-primary/90 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`p-6 border-b border-border flex ${isCollapsed ? "justify-center px-0" : ""}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[40px] w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className={`transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
            <h2 className="text-lg font-semibold text-foreground">RumaKita</h2>
            <p className="text-xs text-muted-foreground">Kelola Warga</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
        {/* Role badge */}
        {!isCollapsed && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Masuk sebagai</p>
            <p className="text-sm font-semibold text-foreground">{roleLabel}</p>
          </div>
        )}

        <div className="space-y-1">
          {visibleModules.map((module) => {
            const isActive = url === module.href || url.startsWith(module.href + "/");
            return (
              <Link
                key={module.id}
                href={module.href}
                title={isCollapsed ? module.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <module.icon className="w-5 h-5 shrink-0" />
                <span className={`text-sm font-medium transition-all duration-200 whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
                  {module.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        {/* Pengaturan collapsible submenu */}
        {isCollapsed ? (
          /* When collapsed, just show Settings icon linking to profile */
          <Link
            href="/profile"
            title="Pengaturan"
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all justify-center ${
              isPengaturanActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
          </Link>
        ) : (
          <>
            <button
              onClick={() => setIsPengaturanOpen(!isPengaturanOpen)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isPengaturanActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">Pengaturan</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPengaturanOpen ? "rotate-180" : ""}`} />
            </button>

            {isPengaturanOpen && (
              <div className="ml-4 pl-4 border-l-2 border-border space-y-1">
                {visiblePengaturan.map((item) => {
                  const isActive = url === item.href || url.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        <button
          onClick={() => router.post("/logout")}
          title={isCollapsed ? "Keluar" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all ${isCollapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`text-sm font-medium transition-all duration-200 whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
            Keluar
          </span>
        </button>
      </div>
    </div>
    </>
  );
}
