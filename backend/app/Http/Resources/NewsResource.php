<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category,
            'body' => $this->body,
            'cover_image_url' => $this->cover_image_url,
            'is_pinned' => $this->is_pinned,
            'author' => $this->author?->name,
            'published_at' => $this->published_at,
        ];
    }
}
