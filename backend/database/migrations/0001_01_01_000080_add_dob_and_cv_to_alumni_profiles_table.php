<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds fields that the frontend profile page needs but that the original
 * schema never had: date of birth, and a stored CV/resume URL (uploaded via
 * AlumniProfileController::uploadCv). Portfolio and social links already
 * existed as website_url / twitter_url / linkedin_url — no new columns
 * needed for those, they just weren't exposed in the profile form.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('matric_number');
            $table->string('cv_url')->nullable()->after('photo_url');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn(['date_of_birth', 'cv_url']);
        });
    }
};
