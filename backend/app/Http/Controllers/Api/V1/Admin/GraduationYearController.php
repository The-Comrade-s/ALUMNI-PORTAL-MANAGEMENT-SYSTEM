<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StructuralEntityRequest;
use App\Models\GraduationYear;

class GraduationYearController extends Controller
{
    public function index()
    {
        return GraduationYear::withCount('alumniProfiles')->orderByDesc('year')->get();
    }

    public function store(StructuralEntityRequest $request)
    {
        return GraduationYear::create($request->validated());
    }

    public function update(StructuralEntityRequest $request, GraduationYear $graduationYear)
    {
        $graduationYear->update($request->validated());

        return $graduationYear->fresh();
    }

    public function destroy(GraduationYear $graduationYear)
    {
        if ($graduationYear->alumniProfiles()->exists()) {
            return response()->json([
                'message' => 'This graduation year has alumni linked to it and cannot be deleted.',
            ], 422);
        }

        $graduationYear->delete();

        return response()->json(['message' => 'Graduation year deleted.']);
    }
}
