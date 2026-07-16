<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStructuralCrudTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $roleSlug): User
    {
        $role = Role::factory()->create(['slug' => $roleSlug, 'name' => ucfirst($roleSlug)]);

        return User::factory()->create(['role_id' => $role->id, 'status' => 'active']);
    }

    public function test_non_admin_cannot_manage_schools(): void
    {
        $alumni = $this->makeUser(Role::ALUMNI);

        $this->actingAs($alumni)->postJson('/api/v1/admin/schools', [
            'name' => 'School of Engineering',
            'code' => 'ENG',
        ])->assertForbidden();
    }

    public function test_admin_can_create_and_delete_a_school(): void
    {
        $admin = $this->makeUser(Role::ADMIN);

        $create = $this->actingAs($admin)->postJson('/api/v1/admin/schools', [
            'name' => 'School of Engineering',
            'code' => 'ENG',
        ]);
        $create->assertCreated();

        $schoolId = $create->json('id');
        $this->assertDatabaseHas('schools', ['code' => 'ENG']);

        $this->actingAs($admin)->deleteJson("/api/v1/admin/schools/{$schoolId}")->assertOk();
        $this->assertDatabaseMissing('schools', ['id' => $schoolId]);
    }

    public function test_cannot_delete_a_school_that_still_has_departments(): void
    {
        $admin = $this->makeUser(Role::ADMIN);
        $school = School::factory()->create();
        \App\Models\Department::factory()->create(['school_id' => $school->id]);

        $response = $this->actingAs($admin)->deleteJson("/api/v1/admin/schools/{$school->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('schools', ['id' => $school->id]);
    }
}
