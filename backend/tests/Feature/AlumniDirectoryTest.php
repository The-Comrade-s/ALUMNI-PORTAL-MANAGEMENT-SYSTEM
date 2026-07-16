<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Programme;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlumniDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_active_alumni_appear_in_the_directory(): void
    {
        $role = Role::factory()->create(['slug' => Role::ALUMNI, 'name' => 'Alumni']);
        $viewer = User::factory()->create(['role_id' => $role->id, 'status' => 'active']);

        $activeUser = User::factory()->create(['role_id' => $role->id, 'status' => 'active']);
        AlumniProfile::factory()->create(['user_id' => $activeUser->id]);

        $pendingUser = User::factory()->create(['role_id' => $role->id, 'status' => 'pending']);
        AlumniProfile::factory()->create(['user_id' => $pendingUser->id]);

        $response = $this->actingAs($viewer)->getJson('/api/v1/alumni');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains($activeUser->name));
        $this->assertFalse($names->contains($pendingUser->name));
    }

    public function test_directory_can_be_filtered_by_programme(): void
    {
        $role = Role::factory()->create(['slug' => Role::ALUMNI, 'name' => 'Alumni']);
        $viewer = User::factory()->create(['role_id' => $role->id, 'status' => 'active']);

        $programmeA = Programme::factory()->create();
        $programmeB = Programme::factory()->create();

        $userA = User::factory()->create(['role_id' => $role->id, 'status' => 'active']);
        AlumniProfile::factory()->create(['user_id' => $userA->id, 'programme_id' => $programmeA->id]);

        $userB = User::factory()->create(['role_id' => $role->id, 'status' => 'active']);
        AlumniProfile::factory()->create(['user_id' => $userB->id, 'programme_id' => $programmeB->id]);

        $response = $this->actingAs($viewer)->getJson("/api/v1/alumni?programme={$programmeA->id}");

        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains($userA->name));
        $this->assertFalse($names->contains($userB->name));
    }

    public function test_alumni_can_update_their_own_profile(): void
    {
        $role = Role::factory()->create(['slug' => Role::ALUMNI, 'name' => 'Alumni']);
        $user = User::factory()->create(['role_id' => $role->id, 'status' => 'active']);
        AlumniProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patchJson('/api/v1/profile', [
            'bio' => 'Software engineer passionate about backend systems.',
            'employment_status' => 'employed',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('alumni_profiles', ['user_id' => $user->id, 'employment_status' => 'employed']);
    }
}
