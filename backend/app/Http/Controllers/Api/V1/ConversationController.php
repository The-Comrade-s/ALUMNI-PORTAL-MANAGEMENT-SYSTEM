<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendMessageRequest;
use App\Http\Requests\StartConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConversationController extends Controller
{
    /** Conversations the authenticated user participates in. */
    public function index(Request $request)
    {
        $conversations = Conversation::query()
            ->whereHas('participants', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['participants', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->latest('updated_at')
            ->paginate(20);

        return ConversationResource::collection($conversations);
    }

    public function store(StartConversationRequest $request)
    {
        $participantIds = collect($request->validated('participant_ids'))
            ->push($request->user()->id)
            ->unique()
            ->values();

        if ($participantIds->count() < 2) {
            throw ValidationException::withMessages(['participant_ids' => 'Select at least one other participant.']);
        }

        $conversation = DB::transaction(function () use ($request, $participantIds) {
            $conversation = Conversation::create([
                'is_group' => $participantIds->count() > 2,
                'title' => $request->input('title'),
            ]);

            $conversation->participants()->attach($participantIds, ['joined_at' => now()]);

            $message = $conversation->messages()->create([
                'sender_id' => $request->user()->id,
                'body' => $request->validated('body'),
            ]);

            $this->notifyRecipients($conversation, $request->user()->id, $message);

            return $conversation;
        });

        return (new ConversationResource($conversation->load('participants', 'messages')))
            ->response()
            ->setStatusCode(201);
    }

    public function messages(Conversation $conversation, Request $request)
    {
        $this->authorizeParticipant($conversation, $request);

        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->paginate(50);

        return MessageResource::collection($messages);
    }

    public function sendMessage(SendMessageRequest $request, Conversation $conversation)
    {
        $this->authorizeParticipant($conversation, $request);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        $conversation->touch();
        $this->notifyRecipients($conversation, $request->user()->id, $message);

        return new MessageResource($message->load('sender'));
    }

    public function markRead(Conversation $conversation, Request $request)
    {
        $this->authorizeParticipant($conversation, $request);

        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Conversation marked as read.']);
    }

    private function authorizeParticipant(Conversation $conversation, Request $request): void
    {
        abort_unless(
            $conversation->participants()->where('user_id', $request->user()->id)->exists(),
            403,
            'You are not a participant in this conversation.'
        );
    }

    private function notifyRecipients(Conversation $conversation, int $senderId, Message $message): void
    {
        $recipients = $conversation->participants()->where('user_id', '!=', $senderId)->get();

        NotificationService::notifyMany(
            $recipients,
            'new_message',
            'New message',
            \Illuminate\Support\Str::limit($message->body, 80),
            ['conversation_id' => $conversation->id]
        );
    }
}
