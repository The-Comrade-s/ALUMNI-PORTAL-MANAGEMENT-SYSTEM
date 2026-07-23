<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by', 'title', 'description', 'cover_image_url', 'venue',
        'is_virtual', 'start_at', 'end_at', 'registration_deadline', 'status',
    ];

    protected function casts(): array
    {
        return [
            'is_virtual' => 'boolean',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'registration_deadline' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function gallery(): HasMany
    {
        return $this->hasMany(EventGallery::class);
    }
}
