<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StructuralEntityRequest;
use App\Models\Department;

class DepartmentController extends Controller
{
    public function index()
    {
        return Department::with('school')->withCount('programmes')->orderBy('name')->get();
    }

    public function store(StructuralEntityRequest $request)
    {
        return Department::create($request->validated());
    }

    public function update(StructuralEntityRequest $request, Department $department)
    {
        $department->update($request->validated());

        return $department->fresh();
    }

    public function destroy(Department $department)
    {
        if ($department->programmes()->exists()) {
            return response()->json([
                'message' => 'Remove or reassign this department\'s programmes before deleting it.',
            ], 422);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted.']);
    }
}
