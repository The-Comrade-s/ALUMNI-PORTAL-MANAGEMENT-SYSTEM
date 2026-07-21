<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'position' => $this->position,
            'description' => $this->description,
            'salary_range' => $this->salary_range,
            'location' => $this->location,
            'job_type' => $this->job_type,
            'apply_link' => $this->apply_link,
            'deadline_at' => $this->deadline_at,
            'status' => $this->status,
            'posted_by' => $this->poster?->name,
            'created_at' => $this->created_at,
        ];
    }
}
