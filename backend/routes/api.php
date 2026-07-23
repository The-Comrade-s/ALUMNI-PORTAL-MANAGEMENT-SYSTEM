<?php

use App\Http\Controllers\Api\V1\Admin\AlumniApprovalController;
use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\DepartmentController;
use App\Http\Controllers\Api\V1\Admin\GraduationYearController;
use App\Http\Controllers\Api\V1\Admin\ProgrammeController;
use App\Http\Controllers\Api\V1\Admin\ReportController;
use App\Http\Controllers\Api\V1\Admin\SchoolController;
use App\Http\Controllers\Api\V1\AlumniProfileController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\JobPostingController;
use App\Http\Controllers\Api\V1\LookupController;
use App\Http\Controllers\Api\V1\NewsController;
use App\Http\Controllers\Api\V1\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1) — Sanctum bearer-token auth (see AuthController::login).
| Cookie-based Sanctum SPA auth is still supported as a same-origin/
| local-dev fallback (EnsureFrontendRequestsAreStateful stays enabled in
| bootstrap/app.php) but the deployed Vercel/Railway split relies on tokens.
|--------------------------------------------------------------------------
| Not yet wired here: Representative-management controller (assigning/
| removing Class Representatives) and a Settings controller for the
| `settings` table, plus email verification routes. Each follows the exact
| shape of the controllers already registered below.
*/

Route::prefix('v1')->group(function () {

    // ---------- Public ----------
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{news}', [NewsController::class, 'show']);
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{event}', [EventController::class, 'show']);

    Route::get('/lookups/schools', [LookupController::class, 'schools']);
    Route::get('/lookups/departments', [LookupController::class, 'departments']);
    Route::get('/lookups/programmes', [LookupController::class, 'programmes']);
    Route::get('/lookups/graduation-years', [LookupController::class, 'graduationYears']);

    // ---------- Authenticated ----------
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::get('/alumni', [AlumniProfileController::class, 'index']);
        Route::get('/alumni/{alumni}', [AlumniProfileController::class, 'show']);
        Route::patch('/profile', [AlumniProfileController::class, 'updateOwnProfile']);
        Route::post('/profile/photo', [AlumniProfileController::class, 'uploadPhoto']);
        Route::post('/profile/cv', [AlumniProfileController::class, 'uploadCv']);

        Route::get('/jobs', [JobPostingController::class, 'index']);
        Route::get('/jobs/{job}', [JobPostingController::class, 'show']);
        Route::post('/jobs', [JobPostingController::class, 'store']);
        Route::patch('/jobs/{job}', [JobPostingController::class, 'update']);
        Route::delete('/jobs/{job}', [JobPostingController::class, 'destroy']);

        Route::post('/events/{event}/register', [EventController::class, 'register']);

        Route::get('/conversations', [ConversationController::class, 'index']);
        Route::post('/conversations', [ConversationController::class, 'store']);
        Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
        Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
        Route::post('/conversations/{conversation}/read', [ConversationController::class, 'markRead']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

        // ---------- Class Representative scope ----------
        Route::middleware('role:class_representative,administrator,super_administrator')->group(function () {
            Route::post('/alumni/{alumni}/verify', [AlumniProfileController::class, 'verify']);
        });

        // ---------- Administrator / Super Administrator ----------
        Route::middleware('role:administrator,super_administrator')->prefix('admin')->group(function () {
            Route::post('/events', [EventController::class, 'store']);
            Route::patch('/events/{event}', [EventController::class, 'update']);
            Route::delete('/events/{event}', [EventController::class, 'destroy']);
            Route::post('/events/banner', [EventController::class, 'uploadBanner']);

            Route::post('/news', [NewsController::class, 'store']);
            Route::patch('/news/{news}', [NewsController::class, 'update']);
            Route::delete('/news/{news}', [NewsController::class, 'destroy']);

            Route::get('/alumni/pending', [AlumniApprovalController::class, 'index']);
            Route::post('/alumni/{user}/approve', [AlumniApprovalController::class, 'approve']);
            Route::post('/alumni/{user}/reject', [AlumniApprovalController::class, 'reject']);

            Route::apiResource('schools', SchoolController::class)->except(['show'])->names('admin.schools');
            Route::apiResource('departments', DepartmentController::class)->except(['show'])->names('admin.departments');
            Route::apiResource('programmes', ProgrammeController::class)->except(['show'])->names('admin.programmes');
            Route::apiResource('graduation-years', GraduationYearController::class)->except(['show'])->names('admin.graduation-years');

            Route::get('/reports/alumni', [ReportController::class, 'alumni']);
            Route::get('/audit-logs', [AuditLogController::class, 'index']);
        });
    });
});
