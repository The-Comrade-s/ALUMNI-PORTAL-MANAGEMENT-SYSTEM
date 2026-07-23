<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StructuralEntityRequest;
use App\Models\Programme;

class ProgrammeController extends Controller
{
    public function index()
    {
        return Programme::with('department.school')->withCount('alumniProfiles')->orderBy('name')->get();
    }

    public function store(StructuralEntityRequest $request)
    {
        return Programme::create($request->validated());
    }

    public function update(StructuralEntityRequest $request, Programme $programme)
    {
        $programme->update($request->validated());

        return $programme->fresh();
    }

    public function destroy(Programme $programme)
    {
        if ($programme->alumniProfiles()->exists()) {
            return response()->json([
                'message' => 'This programme has alumni linked to it and cannot be deleted.',
            ], 422);
        }

        $programme->delete();

        return response()->json(['message' => 'Programme deleted.']);
    }
}
