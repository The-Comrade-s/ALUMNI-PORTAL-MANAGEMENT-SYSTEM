<?php

namespace App\Policies;

use App\Models\AlumniProfile;
use App\Models\Role;
use App\Models\User;

class AlumniProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isApproved() || $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN);
    }

    public function view(User $user, AlumniProfile $profile): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, AlumniProfile $profile): bool
    {
        return $user->id === $profile->user_id
            || $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN);
    }

    public function verify(User $user, AlumniProfile $profile): bool
    {
        if ($user->hasRole(Role::ADMIN, Role::SUPER_ADMIN)) {
            return true;
        }

        // Class reps may only verify alumni within their own programme/year.
        return $user->hasRole(Role::CLASS_REP)
            && $user->representative?->programme_id === $profile->programme_id
            && $user->representative?->graduation_year_id === $profile->graduation_year_id;
    }
}
