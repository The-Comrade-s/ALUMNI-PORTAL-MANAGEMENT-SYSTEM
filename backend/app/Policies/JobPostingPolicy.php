<?php

namespace App\Policies;

use App\Models\JobPosting;
use App\Models\Role;
use App\Models\User;

class JobPostingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isApproved();
    }

    public function view(User $user, JobPosting $job): bool
    {
        return $user->isApproved();
    }

    public function create(User $user): bool
    {
        return $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN, Role::CLASS_REP);
    }

    public function update(User $user, JobPosting $job): bool
    {
        return $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN)
            || ($user->hasRole(Role::CLASS_REP) && $user->id === $job->posted_by);
    }

    public function delete(User $user, JobPosting $job): bool
    {
        return $this->update($user, $job);
    }
}
