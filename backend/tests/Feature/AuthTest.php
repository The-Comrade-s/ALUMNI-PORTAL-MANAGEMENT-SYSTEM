<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\GraduationYear;
use App\Models\Programme;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function seedRoles(): void
    {
        foreach ([Role::GUEST, Role::ALUMNI, Role::CLASS_REP, Role::ADMIN, Role::SUPER_ADMIN] as $slug) {
            Role::factory()->create(['slug' => $slug, 'name' => ucfirst($slug)]);
        }
    }

    public function test_alumni_can_register_and_account_is_pending(): void
    {
        $this->seedRoles();
        $school = School::factory()->create();
        $department = Department::factory()->create(['school_id' => $school->id]);
        $programme = Programme::factory()->create(['department_id' => $department->id]);
        $year = GraduationYear::factory()->create();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'phone' => '08000000000',
            'matric_number' => 'GPS/CSC/2024/0001',
            'school_id' => $school->id,
            'department_id' => $department->id,
            'programme_id' => $programme->id,
            'graduation_year_id' => $year->id,
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'ada@example.com', 'status' => 'pending']);
        $this->assertDatabaseHas('alumni_profiles', ['matric_number' => 'GPS/CSC/2024/0001']);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        $this->seedRoles();
        $department = Department::factory()->create();
        $programme = Programme::factory()->create(['department_id' => $department->id]);
        $year = GraduationYear::factory()->create();

        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Duplicate Person',
            'email' => 'taken@example.com',
            'matric_number' => 'GPS/CSC/2024/0002',
            'school_id' => $department->school_id,
            'department_id' => $department->id,
            'programme_id' => $programme->id,
            'graduation_year_id' => $year->id,
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_log_in_with_correct_credentials(): void
    {
        $this->seedRoles();
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertOk()->assertJsonStructure(['user' => ['id', 'name', 'email']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->seedRoles();
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }
}
