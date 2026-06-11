import { PropsWithChildren } from "react";
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

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userName={userName} role={userRole} perumahan="Griya Asri Residence" />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
