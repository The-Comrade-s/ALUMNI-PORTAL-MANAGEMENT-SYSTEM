<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Upload a banner image for an event (admin/super admin only — this
     * route sits behind the `role:administrator,super_administrator`
     * group in routes/api.php). Returns a URL to hand back to POST
     * /admin/events or PATCH /admin/events/{event} as `cover_image_url`.
     */
    public function uploadBanner(Request $request)
    {
        $request->validate([
            'banner' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $path = $request->file('banner')->store('event-banners', 'public');

        return response()->json(['cover_image_url' => asset('storage/' . $path)]);
    }

    public function index(Request $request)
    {
        $events = Event::query()
            ->withCount('registrations')
            ->with(['registrations' => fn ($q) => $q->where('user_id', $request->user()?->id)])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->orderBy('start_at')
            ->paginate($request->integer('per_page', 20));

        return EventResource::collection($events);
    }

    public function store(EventRequest $request)
    {
        $this->authorize('create', Event::class);

        $event = Event::create([...$request->validated(), 'created_by' => $request->user()->id]);

        return new EventResource($event);
    }

    public function show(Event $event, Request $request)
    {
        return new EventResource($event->loadCount('registrations')->load([
            'registrations' => fn ($q) => $q->where('user_id', $request->user()?->id),
        ]));
    }

    public function update(EventRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        $event->update($request->validated());

        return new EventResource($event->fresh());
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);

        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }

    public function register(Event $event, Request $request)
    {
        $this->authorize('register', $event);

        $registration = EventRegistration::firstOrCreate(
            ['event_id' => $event->id, 'user_id' => $request->user()->id],
            ['status' => 'registered', 'registered_at' => now()]
        );

        NotificationService::notify(
            $request->user(),
            'event_registration',
            "You're registered for {$event->title}",
            $event->venue ? "See you at {$event->venue}." : 'This is a virtual event — check your email for the link.',
            ['event_id' => $event->id]
        );

        return response()->json(['message' => 'Registered for event.', 'registration' => $registration]);
    }
}
