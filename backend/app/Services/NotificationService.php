<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

/**
 * Central place to create in-app notifications. Kept deliberately simple
 * (direct DB insert) so it's easy to later swap for Laravel's native
 * Notification facade + queued email/broadcast channels without touching
 * every call site.
 */
class NotificationService
{
    public static function notify(User $user, string $type, string $title, ?string $body = null, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);
    }

    public static function notifyMany(iterable $users, string $type, string $title, ?string $body = null, array $data = []): void
    {
        foreach ($users as $user) {
            self::notify($user, $type, $title, $body, $data);
        }
    }
}
