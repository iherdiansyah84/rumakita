<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$role = \App\Models\Role::where('name', 'warga')->first();
\App\Models\RolePermission::updateOrCreate(
    ['role_id' => $role->id, 'module' => 'warga'],
    ['actions' => ['view', 'update']]
);
echo "Done";
