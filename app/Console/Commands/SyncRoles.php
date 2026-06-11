<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Console\Command;

class SyncRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'roles:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize system roles with the defined permissions in config';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting role synchronization...');

        $pengurus = Role::where('name', 'pengurus')->first();
        if ($pengurus) {
            $this->syncRolePermissions($pengurus, config('permissions.pengurus', []));
            $this->info('Synced permissions for Pengurus.');
        }

        $warga = Role::where('name', 'warga')->first();
        if ($warga) {
            $this->syncRolePermissions($warga, config('permissions.warga', []));
            $this->info('Synced permissions for Warga.');
        }

        $this->info('Role synchronization completed successfully.');
    }

    private function syncRolePermissions(Role $role, array $permissions)
    {
        $allModules = config('permissions.modules', []);

        foreach ($permissions as $module => $actions) {
            // Only save if the module is valid and has actions
            if (isset($allModules[$module]) && !empty($actions)) {
                // Filter only valid actions for this module
                $validActions = array_intersect($actions, $allModules[$module]);

                if (!empty($validActions)) {
                    RolePermission::updateOrCreate(
                        ['role_id' => $role->id, 'module' => $module],
                        ['actions' => array_values($validActions)]
                    );
                }
            }
        }
    }
}
