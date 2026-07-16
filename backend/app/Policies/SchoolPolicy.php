<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class SchoolPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole(Role::SUPER_ADMIN) ? true : null;
    }

    public function manage(User $user): bool
    {
        return $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN);
    }
}
