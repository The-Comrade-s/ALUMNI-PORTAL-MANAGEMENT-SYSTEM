<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\GraduationYear;
use App\Models\Programme;
use App\Models\School;
use Illuminate\Http\Request;

/**
 * Public, read-only lookups for the academic hierarchy — used by the
 * registration form's cascading School → Department → Programme selects,
 * and the directory search filters. No auth required; nothing here is
 * mutable through this controller.
 */
class LookupController extends Controller
{
    public function schools()
    {
        return School::orderBy('name')->get(['id', 'name', 'code']);
    }

    public function departments(Request $request)
    {
        return Department::query()
            ->when($request->filled('school_id'), fn ($q) => $q->where('school_id', $request->school_id))
            ->orderBy('name')
            ->get(['id', 'school_id', 'name', 'code']);
    }

    public function programmes(Request $request)
    {
        return Programme::query()
            ->when($request->filled('department_id'), fn ($q) => $q->where('department_id', $request->department_id))
            ->orderBy('name')
            ->get(['id', 'department_id', 'name', 'duration_years']);
    }

    public function graduationYears()
    {
        return GraduationYear::orderByDesc('year')->get(['id', 'year', 'label']);
    }
}
