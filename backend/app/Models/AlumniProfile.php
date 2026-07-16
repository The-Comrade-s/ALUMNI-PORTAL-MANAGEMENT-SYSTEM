<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlumniProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'matric_number', 'programme_id', 'graduation_year_id',
        'photo_url', 'bio', 'current_occupation', 'employer', 'employment_status',
        'location_city', 'location_country', 'linkedin_url', 'twitter_url',
        'website_url', 'skills', 'achievements', 'verified_by', 'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'achievements' => 'array',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(Programme::class);
    }

    public function graduationYear(): BelongsTo
    {
        return $this->belongsTo(GraduationYear::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
