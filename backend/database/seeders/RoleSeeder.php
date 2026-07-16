<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            Role::GUEST => 'Unauthenticated visitor with read-only public access.',
            Role::ALUMNI => 'Verified graduate with directory, jobs, events and messaging access.',
            Role::CLASS_REP => 'Alumni with elevated moderation scope for their programme/graduation year.',
            Role::ADMIN => 'Institution staff managing content and alumni approvals.',
            Role::SUPER_ADMIN => 'Full system access including admin and role management.',
        ];

        foreach ($roles as $slug => $description) {
            Role::updateOrCreate(
                ['slug' => $slug],
                ['name' => ucwords(str_replace('_', ' ', $slug)), 'description' => $description]
            );
        }

        $permissions = [
            'manage-schools', 'manage-departments', 'manage-programmes', 'manage-graduation-years',
            'approve-alumni', 'manage-representatives', 'manage-jobs', 'manage-events',
            'manage-news', 'view-reports', 'manage-admins', 'view-audit-logs', 'manage-settings',
        ];

        foreach ($permissions as $slug) {
            Permission::updateOrCreate(
                ['slug' => $slug],
                ['name' => ucwords(str_replace('-', ' ', $slug))]
            );
        }

        // Wire baseline permission sets.
        $adminPerms = ['manage-jobs', 'manage-events', 'manage-news', 'approve-alumni', 'manage-representatives', 'view-reports'];
        Role::where('slug', Role::ADMIN)->first()
            ?->permissions()->sync(Permission::whereIn('slug', $adminPerms)->pluck('id'));

        Role::where('slug', Role::SUPER_ADMIN)->first()
            ?->permissions()->sync(Permission::pluck('id'));
    }
}
