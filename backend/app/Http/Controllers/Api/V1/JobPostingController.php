<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class JobPostingController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', JobPosting::class);

        $jobs = JobPosting::query()
            ->with('poster')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status), fn ($q) => $q->where('status', 'open'))
            ->when($request->filled('job_type'), fn ($q) => $q->where('job_type', $request->job_type))
            ->when($request->filled('location'), fn ($q) => $q->where('location', 'ilike', '%' . $request->location . '%'))
            ->when($request->filled('q'), fn ($q) => $q->where(function ($q2) use ($request) {
                $q2->where('position', 'ilike', '%' . $request->q . '%')
                   ->orWhere('company_name', 'ilike', '%' . $request->q . '%');
            }))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return JobPostingResource::collection($jobs);
    }

    public function store(JobPostingRequest $request)
    {
        $this->authorize('create', JobPosting::class);

        $job = JobPosting::create([...$request->validated(), 'posted_by' => $request->user()->id]);

        return new JobPostingResource($job->load('poster'));
    }

    public function show(JobPosting $job)
    {
        $this->authorize('view', $job);

        return new JobPostingResource($job->load('poster'));
    }

    public function update(JobPostingRequest $request, JobPosting $job)
    {
        $this->authorize('update', $job);

        $job->update($request->validated());

        return new JobPostingResource($job->fresh('poster'));
    }

    public function destroy(JobPosting $job)
    {
        $this->authorize('delete', $job);

        $job->delete();

        return response()->json(['message' => 'Job posting deleted.']);
    }
}
