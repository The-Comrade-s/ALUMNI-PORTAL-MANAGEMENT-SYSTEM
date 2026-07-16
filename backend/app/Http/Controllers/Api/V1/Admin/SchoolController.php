<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StructuralEntityRequest;
use App\Models\School;

class SchoolController extends Controller
{
    public function index()
    {
        return School::withCount('departments')->orderBy('name')->get();
    }

    public function store(StructuralEntityRequest $request)
    {
        return School::create($request->validated());
    }

    public function update(StructuralEntityRequest $request, School $school)
    {
        $school->update($request->validated());

        return $school->fresh();
    }

    public function destroy(School $school)
    {
        // Restricted FK on departments prevents deletion while children exist —
        // surfaced here as a friendly message instead of a raw DB error.
        if ($school->departments()->exists()) {
            return response()->json([
                'message' => 'Remove or reassign this school\'s departments before deleting it.',
            ], 422);
        }

        $school->delete();

        return response()->json(['message' => 'School deleted.']);
    }
}
