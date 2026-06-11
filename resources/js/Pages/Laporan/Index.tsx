import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { BarChart3 } from "lucide-react";

export default function Laporan() {
    return (
        <AppLayout>
            <Head title="Laporan - RumaKita" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-2">Laporan</h1>
                    <p className="text-muted-foreground">Laporan dan statistik perumahan</p>
                </div>
                <div className="flex items-center justify-center h-64 bg-card rounded-xl border border-border">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Modul Laporan dalam pengembangan</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
