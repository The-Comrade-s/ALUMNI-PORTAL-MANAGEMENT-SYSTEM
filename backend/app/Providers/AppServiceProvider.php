<?php

namespace App\Providers;

use App\Models\Department;
use App\Models\Event;
use App\Models\GraduationYear;
use App\Models\JobPosting;
use App\Models\News;
use App\Models\Programme;
use App\Models\School;
use App\Observers\AuditObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Audit-log every mutation on structural/admin-managed entities.
        foreach ([School::class, Department::class, Programme::class, GraduationYear::class, JobPosting::class, Event::class, News::class] as $model) {
            $model::observe(AuditObserver::class);
        }
    }
}
