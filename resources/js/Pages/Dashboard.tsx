import { Head } from "@inertiajs/react";
import AppLayout from "../Layouts/AppLayout";
import { Dashboard as DashboardContent } from "../src/app/components/Dashboard";

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard - RumaKita" />
            <DashboardContent />
        </AppLayout>
    );
}
