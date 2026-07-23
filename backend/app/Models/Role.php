<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description'];

    // Well-known role slugs used across the app for readable checks.
    public const GUEST = 'guest';
    public const ALUMNI = 'alumni';
    public const CLASS_REP = 'class_representative';
    public const ADMIN = 'administrator';
    public const SUPER_ADMIN = 'super_administrator';

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }
}
