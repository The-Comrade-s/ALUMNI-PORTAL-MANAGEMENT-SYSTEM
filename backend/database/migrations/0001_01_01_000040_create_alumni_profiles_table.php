<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alumni_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('matric_number')->unique();
            $table->foreignId('programme_id')->constrained()->restrictOnDelete();
            $table->foreignId('graduation_year_id')->constrained()->restrictOnDelete();
            $table->string('photo_url')->nullable();
            $table->text('bio')->nullable();
            $table->string('current_occupation')->nullable();
            $table->string('employer')->nullable();
            $table->enum('employment_status', ['employed', 'self_employed', 'unemployed', 'student'])->default('unemployed');
            $table->string('location_city')->nullable();
            $table->string('location_country')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('website_url')->nullable();
            $table->jsonb('skills')->nullable();
            $table->jsonb('achievements')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['programme_id', 'graduation_year_id']);
            $table->index(['employment_status']);
        });

        Schema::create('representatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('programme_id')->constrained()->cascadeOnDelete();
            $table->foreignId('graduation_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointed_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('appointed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['programme_id', 'graduation_year_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('representatives');
        Schema::dropIfExists('alumni_profiles');
    }
};
