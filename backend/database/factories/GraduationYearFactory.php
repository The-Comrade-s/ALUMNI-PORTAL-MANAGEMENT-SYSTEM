<?php

namespace Database\Factories;

use App\Models\GraduationYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class GraduationYearFactory extends Factory
{
    protected $model = GraduationYear::class;

    public function definition(): array
    {
        $year = $this->faker->unique()->numberBetween(2015, 2026);

        return ['year' => $year, 'label' => (string) $year];
    }
}
