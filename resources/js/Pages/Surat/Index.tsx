import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { SuratModule } from '@/src/app/components/SuratModule';

export default function Index({ surat, pilihanWarga }: { surat: any[], pilihanWarga: any[] }) {
    return (
        <AppLayout>
            <Head title="Surat Digital" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <SuratModule suratList={surat} pilihanWarga={pilihanWarga} />
                </div>
            </div>
        </AppLayout>
    );
}
