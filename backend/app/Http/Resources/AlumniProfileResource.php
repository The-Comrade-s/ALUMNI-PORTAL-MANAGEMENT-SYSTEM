<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlumniProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->user->name,
            'email' => $this->when($request->user()?->hasRole('administrator', 'super_administrator'), $this->user->email),
            'matric_number' => $this->matric_number,
            'photo_url' => $this->photo_url,
            'bio' => $this->bio,
            'occupation' => $this->current_occupation,
            'employer' => $this->employer,
            'employment_status' => $this->employment_status,
            'location' => trim("{$this->location_city}, {$this->location_country}", ', '),
            'skills' => $this->skills ?? [],
            'programme' => $this->programme?->name,
            'department' => $this->programme?->department?->name,
            'school' => $this->programme?->department?->school?->name,
            'graduation_year' => $this->graduationYear?->year,
            'verified' => (bool) $this->verified_at,
            'social' => [
                'linkedin' => $this->linkedin_url,
                'twitter' => $this->twitter_url,
                'website' => $this->website_url,
            ],
        ];
    }
}
