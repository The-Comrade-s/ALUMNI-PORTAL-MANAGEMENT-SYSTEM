<?php

namespace Database\Factories;

use App\Models\AlumniProfile;
use App\Models\GraduationYear;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AlumniProfileFactory extends Factory
{
    protected $model = AlumniProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'matric_number' => strtoupper($this->faker->unique()->bothify('GPS/???/####')),
            'programme_id' => Programme::factory(),
            'graduation_year_id' => GraduationYear::factory(),
            'employment_status' => $this->faker->randomElement(['employed', 'self_employed', 'unemployed', 'student']),
        ];
    }
}
