<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Representative extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'programme_id', 'graduation_year_id', 'appointed_by', 'appointed_at'];

    protected function casts(): array
    {
        return ['appointed_at' => 'datetime'];
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
}
