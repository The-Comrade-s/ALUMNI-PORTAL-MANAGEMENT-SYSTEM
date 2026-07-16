<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    private function makeAlumni(): User
    {
        $role = Role::factory()->create(['slug' => Role::ALUMNI, 'name' => 'Alumni']);

        return User::factory()->create(['role_id' => $role->id, 'status' => 'active']);
    }

    public function test_user_can_start_a_conversation_and_send_first_message(): void
    {
        $sender = $this->makeAlumni();
        $recipient = $this->makeAlumni();

        $response = $this->actingAs($sender)->postJson('/api/v1/conversations', [
            'participant_ids' => [$recipient->id],
            'body' => 'Hey, how are you doing?',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('messages', ['body' => 'Hey, how are you doing?', 'sender_id' => $sender->id]);
        $this->assertDatabaseHas('notifications', ['user_id' => $recipient->id, 'type' => 'new_message']);
    }

    public function test_non_participant_cannot_read_a_conversation(): void
    {
        $sender = $this->makeAlumni();
        $recipient = $this->makeAlumni();
        $outsider = $this->makeAlumni();

        $create = $this->actingAs($sender)->postJson('/api/v1/conversations', [
            'participant_ids' => [$recipient->id],
            'body' => 'Hello there',
        ]);

        $conversationId = $create->json('data.id');

        $this->actingAs($outsider)->getJson("/api/v1/conversations/{$conversationId}/messages")->assertForbidden();
        $this->actingAs($recipient)->getJson("/api/v1/conversations/{$conversationId}/messages")->assertOk();
    }
}
