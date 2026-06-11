import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { WargaModule } from "./components/WargaModule";
import { KeuanganModule } from "./components/KeuanganModule";
import { ForumModule } from "./components/ForumModule";
import { MarketplaceModule } from "./components/MarketplaceModule";
import { PerumahanModule } from "./components/PerumahanModule";
import { VotingModule } from "./components/VotingModule";
import { AgendaModule } from "./components/AgendaModule";
import { GaleriModule } from "./components/GaleriModule";

export default function App() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const { auth } = usePage<{ auth: { user: { name: string; role_name: string; role_label: string; email: string } | null } }>().props;
  
  const user = auth?.user;
  const userName = user?.name || "Guest";
  const userRole = user?.role_label || "Guest";

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "perumahan":
        return <PerumahanModule />;
      case "warga":
        return <WargaModule />;
      case "keuangan":
        return <KeuanganModule />;
      case "forum":
        return <ForumModule />;
      case "marketplace":
        return <MarketplaceModule />;
      case "voting":
        return <VotingModule />;
      case "agenda":
        return <AgendaModule />;
      case "galeri":
        return <GaleriModule />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Modul {activeModule}</h2>
              <p className="text-muted-foreground">Dalam pengembangan</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={userName}
          role={userRole}
          perumahan="Griya Asri Residence"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}