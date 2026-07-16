<?php

namespace App\Policies;

use App\Models\News;
use App\Models\Role;
use App\Models\User;

class NewsPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN);
    }

    public function update(User $user, News $news): bool
    {
        return $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN) || $user->id === $news->author_id;
    }

    public function delete(User $user, News $news): bool
    {
        return $this->update($user, $news);
    }
}
