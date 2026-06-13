import { Head, usePage } from "@inertiajs/react";
import AppLayout from "../Layouts/AppLayout";
import { Dashboard as DashboardContent } from "../src/app/components/Dashboard";

export default function Dashboard() {
    const { stats, pengumuman, recentActivities } = usePage<{
        stats: any;
        pengumuman: any[];
        recentActivities: any[];
    }>().props;

    return (
        <AppLayout>
            <Head title="Dashboard - RumaKita" />
            <DashboardContent 
                stats={stats} 
                pengumuman={pengumuman} 
                recentActivities={recentActivities} 
            />
        </AppLayout>
    );
}
