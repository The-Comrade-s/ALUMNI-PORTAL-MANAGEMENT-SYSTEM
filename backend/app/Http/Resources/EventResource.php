<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'cover_image_url' => $this->cover_image_url,
            'venue' => $this->venue,
            'is_virtual' => $this->is_virtual,
            'start_at' => $this->start_at,
            'end_at' => $this->end_at,
            'registration_deadline' => $this->registration_deadline,
            'status' => $this->status,
            'registrations_count' => $this->whenCounted('registrations'),
            'is_registered' => $this->when(
                $request->user(),
                fn () => $this->registrations->contains('user_id', $request->user()?->id)
            ),
        ];
    }
}
