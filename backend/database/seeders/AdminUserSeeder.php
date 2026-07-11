<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('slug', Role::SUPER_ADMIN)->firstOrFail();

        User::updateOrCreate(
            ['email' => 'superadmin@gatewaypolysaapade.edu.ng'],
            [
                'name' => 'System Super Administrator',
                'password' => Hash::make(env('SUPER_ADMIN_SEED_PASSWORD', 'ChangeMe#12345')),
                'role_id' => $superAdminRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }
}
