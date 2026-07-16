<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role_id' => Role::factory()->alumni(),
            'status' => 'active',
            'remember_token' => Str::random(10),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function withRole(string $slug): static
    {
        return $this->state(fn () => ['role_id' => Role::factory()->state(['slug' => $slug, 'name' => ucfirst($slug)])]);
    }
}
