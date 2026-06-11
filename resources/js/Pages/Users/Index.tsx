import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { UserModule } from "../../src/app/components/UserModule";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "pengurus" | "warga";
  created_at: string;
};

type Props = {
  users: UserRow[];
  stats: { total: number; pengurus: number; warga: number };
};

export default function Users({ users, stats }: Props) {
  return (
    <AppLayout>
      <Head title="Kelola Pengguna - RumaKita" />
      <UserModule users={users} stats={stats} />
    </AppLayout>
  );
}
