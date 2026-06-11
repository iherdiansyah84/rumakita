<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Alter role_permissions: drop boolean columns, add JSON actions
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropColumn(['can_read', 'can_create', 'can_update', 'can_delete']);
            $table->json('actions')->default('[]');
        });

        // 2. Add role_id to users
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('id')->constrained('roles')->nullOnDelete();
        });

        // 3. Create default roles & migrate existing user data
        $pengurusId = DB::table('roles')->insertGetId([
            'name'        => 'pengurus',
            'label'       => 'Pengurus',
            'description' => 'Administrator perumahan dengan akses penuh',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $wargaId = DB::table('roles')->insertGetId([
            'name'        => 'warga',
            'label'       => 'Warga',
            'description' => 'Penghuni perumahan dengan akses terbatas',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Migrate existing users
        DB::table('users')->where('role', 'pengurus')->update(['role_id' => $pengurusId]);
        DB::table('users')->where('role', 'warga')->update(['role_id' => $wargaId]);
        DB::table('users')->whereNull('role_id')->update(['role_id' => $wargaId]);

        // 4. Drop old role string column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        // 5. Seed default permissions for Pengurus (full access)
        $allModules = [
            'dashboard'   => ['view'],
            'perumahan'   => ['view', 'create', 'update', 'delete'],
            'warga'       => ['view', 'create', 'update', 'delete', 'export'],
            'keuangan'    => ['view', 'create', 'update', 'delete', 'export'],
            'forum'       => ['view', 'create', 'update', 'delete', 'like', 'comment'],
            'galeri'      => ['view', 'create', 'update', 'delete'],
            'voting'      => ['view', 'create', 'update', 'delete', 'vote'],
            'agenda'      => ['view', 'create', 'update', 'delete'],
            'marketplace' => ['view', 'create', 'update', 'delete'],
            'laporan'     => ['view', 'export'],
            'users'       => ['view', 'create', 'update', 'delete'],
            'roles'       => ['view', 'create', 'update', 'delete'],
        ];

        foreach ($allModules as $module => $actions) {
            DB::table('role_permissions')->insert([
                'role_id'    => $pengurusId,
                'module'     => $module,
                'actions'    => json_encode($actions),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Seed default permissions for Warga (limited access)
        $wargaModules = [
            'dashboard'   => ['view'],
            'perumahan'   => ['view'],
            'warga'       => ['view'],
            'keuangan'    => ['view'],
            'forum'       => ['view', 'create', 'update', 'delete', 'like', 'comment'],
            'galeri'      => ['view', 'create', 'update', 'delete'],
            'voting'      => ['view', 'vote'],
            'agenda'      => ['view'],
            'marketplace' => ['view', 'create', 'update', 'delete'],
            'laporan'     => [],
            'users'       => [],
            'roles'       => [],
        ];

        foreach ($wargaModules as $module => $actions) {
            if (!empty($actions)) {
                DB::table('role_permissions')->insert([
                    'role_id'    => $wargaId,
                    'module'     => $module,
                    'actions'    => json_encode($actions),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Re-add role string column
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('warga');
        });

        // Migrate back
        $pengurusRole = DB::table('roles')->where('name', 'pengurus')->first();
        $wargaRole = DB::table('roles')->where('name', 'warga')->first();

        if ($pengurusRole) {
            DB::table('users')->where('role_id', $pengurusRole->id)->update(['role' => 'pengurus']);
        }
        if ($wargaRole) {
            DB::table('users')->where('role_id', $wargaRole->id)->update(['role' => 'warga']);
        }

        // Drop role_id foreign key and column
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
        });

        // Revert role_permissions
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropColumn('actions');
            $table->boolean('can_read')->default(false);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_update')->default(false);
            $table->boolean('can_delete')->default(false);
        });

        // Clean up seeded roles
        DB::table('role_permissions')->truncate();
        DB::table('roles')->truncate();
    }
};
