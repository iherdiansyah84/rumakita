<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ─── Create Demo Perumahan ───────────────────────────────
        $perumahan = \App\Models\Perumahan::firstOrCreate(['nama' => 'Perumahan Demo'], [
            'lokasi' => 'Jl. Demo No. 123',
            'admin_nama' => 'Admin Pengurus',
            'telepon' => '081234567890',
            'email' => 'pengurus@rumakita.com',
            'total_unit' => 100,
            'status' => 'active',
        ]);

        // ─── Create Roles ────────────────────────────────────────
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin'], [
            'label'       => 'Super Admin',
            'description' => 'Administrator sistem dengan akses tak terbatas ke seluruh fitur dan pengaturan',
        ]);

        $pengurus = Role::firstOrCreate(['name' => 'pengurus'], [
            'label'       => 'Pengurus',
            'description' => 'Administrator perumahan dengan akses penuh',
        ]);

        $warga = Role::firstOrCreate(['name' => 'warga'], [
            'label'       => 'Warga',
            'description' => 'Penghuni perumahan dengan akses terbatas',
        ]);

        // ─── Permissions: Pengurus (full access) ─────────────────
        $allModules = config('permissions.pengurus', []);

        foreach ($allModules as $module => $actions) {
            RolePermission::updateOrCreate(
                ['role_id' => $pengurus->id, 'module' => $module],
                ['actions' => $actions]
            );
        }

        // ─── Permissions: Warga (limited access) ────────────────
        $wargaModules = config('permissions.warga', []);

        foreach ($wargaModules as $module => $actions) {
            RolePermission::updateOrCreate(
                ['role_id' => $warga->id, 'module' => $module],
                ['actions' => $actions]
            );
        }

        // ─── Demo Users ──────────────────────────────────────────
        User::firstOrCreate(['email' => 'superadmin@rumakita.com'], [
            'name'     => 'Super Administrator',
            'password' => bcrypt('password'),
            'role_id'  => $superAdmin->id,
            'perumahan_id' => null, // Super admin tidak terikat satu perumahan
        ]);

        User::firstOrCreate(['email' => 'pengurus@rumakita.com'], [
            'name'     => 'Admin Pengurus',
            'password' => bcrypt('password'),
            'role_id'  => $pengurus->id,
            'perumahan_id' => $perumahan->id,
        ]);

        $wargaAccounts = [
            ['name' => 'Budi Santoso',  'email' => 'budi@rumakita.com'],
            ['name' => 'Siti Aminah',   'email' => 'siti@rumakita.com'],
            ['name' => 'Ahmad Hidayat', 'email' => 'ahmad@rumakita.com'],
        ];

        foreach ($wargaAccounts as $data) {
            User::firstOrCreate(['email' => $data['email']], [
                'name'     => $data['name'],
                'password' => bcrypt('password'),
                'role_id'  => $warga->id,
                'perumahan_id' => $perumahan->id,
            ]);
        }
    }
}
