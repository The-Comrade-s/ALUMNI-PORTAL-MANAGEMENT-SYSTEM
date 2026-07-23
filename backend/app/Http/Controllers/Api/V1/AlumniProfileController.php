<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAlumniProfileRequest;
use App\Http\Resources\AlumniProfileResource;
use App\Models\AlumniProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AlumniProfileController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AlumniProfile::class);

        $profiles = AlumniProfile::query()
            ->with(['user', 'programme.department.school', 'graduationYear'])
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->when($request->filled('school'), fn ($q) => $q->whereHas('programme.department', fn ($q2) => $q2->where('school_id', $request->school)))
            ->when($request->filled('department'), fn ($q) => $q->whereHas('programme', fn ($q2) => $q2->where('department_id', $request->department)))
            ->when($request->filled('programme'), fn ($q) => $q->where('programme_id', $request->programme))
            ->when($request->filled('graduation_year'), fn ($q) => $q->where('graduation_year_id', $request->graduation_year))
            ->when($request->filled('employment_status'), fn ($q) => $q->where('employment_status', $request->employment_status))
            ->when($request->filled('q'), fn ($q) => $q->whereHas('user', fn ($q2) => $q2->where('name', 'ilike', '%' . $request->q . '%')))
            ->paginate($request->integer('per_page', 20));

        return AlumniProfileResource::collection($profiles);
    }

    public function show(AlumniProfile $alumni)
    {
        $this->authorize('view', $alumni);

        return new AlumniProfileResource($alumni->load(['user', 'programme.department.school', 'graduationYear']));
    }

    public function updateOwnProfile(UpdateAlumniProfileRequest $request)
    {
        $profile = $request->user()->alumniProfile;
        $this->authorize('update', $profile);

        $profile->update($request->validated());

        return new AlumniProfileResource($profile->fresh());
    }

    public function verify(AlumniProfile $alumni, Request $request)
    {
        $this->authorize('verify', $alumni);

        $alumni->update(['verified_by' => $request->user()->id, 'verified_at' => now()]);
        $alumni->user->update(['status' => 'active']);

        return new AlumniProfileResource($alumni->fresh());
    }

    /**
     * Upload/replace the authenticated user's own profile photo.
     * Stored on the public disk under avatars/ — requires `php artisan
     * storage:link` to have been run (see docker/entrypoint.sh).
     */
    public function uploadPhoto(Request $request)
    {
        $profile = $request->user()->alumniProfile;
        $this->authorize('update', $profile);

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($profile->photo_url) {
            $this->deletePublicFile($profile->photo_url);
        }

        $path = $request->file('photo')->store('avatars', 'public');
        $profile->update(['photo_url' => asset('storage/' . $path)]);

        return new AlumniProfileResource($profile->fresh());
    }

    /**
     * Upload/replace the authenticated user's own CV/resume.
     */
    public function uploadCv(Request $request)
    {
        $profile = $request->user()->alumniProfile;
        $this->authorize('update', $profile);

        $request->validate([
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        if ($profile->cv_url) {
            $this->deletePublicFile($profile->cv_url);
        }

        $path = $request->file('cv')->store('cvs', 'public');
        $profile->update(['cv_url' => asset('storage/' . $path)]);

        return new AlumniProfileResource($profile->fresh());
    }

    private function deletePublicFile(string $url): void
    {
        $marker = '/storage/';
        $position = strpos($url, $marker);
        if ($position === false) {
            return;
        }

        $relativePath = substr($url, $position + strlen($marker));
        Storage::disk('public')->delete($relativePath);
    }
}
