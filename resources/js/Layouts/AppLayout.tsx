import { PropsWithChildren, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Sidebar } from "../src/app/components/Sidebar";
import { Header } from "../src/app/components/Header";

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<{
        auth: {
            user: { name: string; role_name: string; role_label: string; email: string } | null;
        };
    }>().props;

    const user = auth?.user;
    const userName = user?.name || "Guest";
    const userRole = user?.role_label || "Guest";

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background relative overflow-hidden">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <Header 
                    userName={userName} 
                    role={userRole} 
                    perumahan="Griya Asri Residence" 
                    onMenuClick={() => setIsMobileOpen(true)} 
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
