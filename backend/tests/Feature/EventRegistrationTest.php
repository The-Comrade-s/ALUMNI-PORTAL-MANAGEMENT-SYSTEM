<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventRegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function makeAlumni(string $status = 'active'): User
    {
        $role = Role::factory()->create(['slug' => Role::ALUMNI, 'name' => 'Alumni']);

        return User::factory()->create(['role_id' => $role->id, 'status' => $status]);
    }

    public function test_active_alumni_can_register_for_an_upcoming_event(): void
    {
        $alumni = $this->makeAlumni();
        $event = Event::factory()->create(['status' => 'upcoming']);

        $response = $this->actingAs($alumni)->postJson("/api/v1/events/{$event->id}/register");

        $response->assertOk();
        $this->assertDatabaseHas('event_registrations', ['event_id' => $event->id, 'user_id' => $alumni->id]);
        $this->assertDatabaseHas('notifications', ['user_id' => $alumni->id, 'type' => 'event_registration']);
    }

    public function test_registering_twice_does_not_create_a_duplicate_row(): void
    {
        $alumni = $this->makeAlumni();
        $event = Event::factory()->create(['status' => 'upcoming']);

        $this->actingAs($alumni)->postJson("/api/v1/events/{$event->id}/register")->assertOk();
        $this->actingAs($alumni)->postJson("/api/v1/events/{$event->id}/register")->assertOk();

        $this->assertEquals(1, \App\Models\EventRegistration::where('event_id', $event->id)->count());
    }

    public function test_pending_alumni_cannot_register_for_events(): void
    {
        $alumni = $this->makeAlumni('pending');
        $event = Event::factory()->create(['status' => 'upcoming']);

        $this->actingAs($alumni)->postJson("/api/v1/events/{$event->id}/register")->assertForbidden();
    }

    public function test_cannot_register_for_a_completed_event(): void
    {
        $alumni = $this->makeAlumni();
        $event = Event::factory()->create(['status' => 'completed']);

        $this->actingAs($alumni)->postJson("/api/v1/events/{$event->id}/register")->assertForbidden();
    }
}
