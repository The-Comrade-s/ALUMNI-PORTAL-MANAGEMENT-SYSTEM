<?php

namespace Tests\Feature;

use App\Models\JobPosting;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobPostingTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $roleSlug, string $status = 'active'): User
    {
        $role = Role::factory()->create(['slug' => $roleSlug, 'name' => ucfirst($roleSlug)]);

        return User::factory()->create(['role_id' => $role->id, 'status' => $status]);
    }

    public function test_alumni_cannot_create_a_job_posting(): void
    {
        $alumni = $this->makeUser(Role::ALUMNI);

        $response = $this->actingAs($alumni)->postJson('/api/v1/jobs', [
            'company_name' => 'Acme Ltd',
            'position' => 'Backend Engineer',
            'description' => 'Build things.',
            'job_type' => 'full_time',
        ]);

        $response->assertForbidden();
    }

    public function test_administrator_can_create_a_job_posting(): void
    {
        $admin = $this->makeUser(Role::ADMIN);

        $response = $this->actingAs($admin)->postJson('/api/v1/jobs', [
            'company_name' => 'Acme Ltd',
            'position' => 'Backend Engineer',
            'description' => 'Build things.',
            'job_type' => 'full_time',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('job_postings', ['company_name' => 'Acme Ltd', 'posted_by' => $admin->id]);
    }

    public function test_job_posting_requires_valid_job_type(): void
    {
        $admin = $this->makeUser(Role::ADMIN);

        $response = $this->actingAs($admin)->postJson('/api/v1/jobs', [
            'company_name' => 'Acme Ltd',
            'position' => 'Backend Engineer',
            'description' => 'Build things.',
            'job_type' => 'not-a-real-type',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['job_type']);
    }

    public function test_only_the_posting_admin_or_a_higher_role_can_delete_it(): void
    {
        $classRep = $this->makeUser(Role::CLASS_REP);
        $otherRep = $this->makeUser(Role::CLASS_REP);

        $job = JobPosting::factory()->create(['posted_by' => $classRep->id]);

        $this->actingAs($otherRep)->deleteJson("/api/v1/jobs/{$job->id}")->assertForbidden();
        $this->actingAs($classRep)->deleteJson("/api/v1/jobs/{$job->id}")->assertOk();
        $this->assertDatabaseMissing('job_postings', ['id' => $job->id]);
    }
}
