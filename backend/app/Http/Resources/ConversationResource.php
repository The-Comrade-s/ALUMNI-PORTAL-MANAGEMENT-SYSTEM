<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lastMessage = $this->messages->sortByDesc('created_at')->first();

        return [
            'id' => $this->id,
            'is_group' => $this->is_group,
            'title' => $this->title,
            'participants' => $this->participants->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
            ]),
            'last_message' => $lastMessage ? [
                'body' => $lastMessage->body,
                'sender_id' => $lastMessage->sender_id,
                'created_at' => $lastMessage->created_at,
            ] : null,
            'unread_count' => $this->when(
                $request->user(),
                fn () => $this->messages
                    ->where('sender_id', '!=', $request->user()->id)
                    ->whereNull('read_at')
                    ->count()
            ),
        ];
    }
}
