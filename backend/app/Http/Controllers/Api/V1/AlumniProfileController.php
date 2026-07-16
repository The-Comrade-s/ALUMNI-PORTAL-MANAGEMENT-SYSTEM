<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAlumniProfileRequest;
use App\Http\Resources\AlumniProfileResource;
use App\Models\AlumniProfile;
use Illuminate\Http\Request;

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
}
