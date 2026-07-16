<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\Role;
use App\Models\User;

class EventPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Event $event): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN);
    }

    public function update(User $user, Event $event): bool
    {
        return $user->hasRole(Role::ADMIN, Role::SUPER_ADMIN)
            || $user->id === $event->created_by;
    }

    public function delete(User $user, Event $event): bool
    {
        return $this->update($user, $event);
    }

    public function register(User $user, Event $event): bool
    {
        return $user->isApproved() && $event->status === 'upcoming';
    }
}
