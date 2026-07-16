<?php

namespace Database\Factories;

use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobPostingFactory extends Factory
{
    protected $model = JobPosting::class;

    public function definition(): array
    {
        return [
            'posted_by' => User::factory(),
            'company_name' => $this->faker->company(),
            'position' => $this->faker->jobTitle(),
            'description' => $this->faker->paragraph(),
            'job_type' => 'full_time',
            'status' => 'open',
            'deadline_at' => now()->addWeeks(2),
        ];
    }
}
