<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPosting extends Model
{
    use HasFactory;

    protected $table = 'job_postings';

    protected $fillable = [
        'posted_by', 'company_name', 'position', 'description', 'salary_range',
        'location', 'job_type', 'apply_link', 'deadline_at', 'status',
    ];

    protected function casts(): array
    {
        return ['deadline_at' => 'datetime'];
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}
