<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Shared validation shape for Admin CRUD on School / Department / Programme.
 * Each controller narrows the rule set it actually needs via $this->route().
 */
class StructuralEntityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by 'role:administrator,super_administrator' middleware
    }

    public function rules(): array
    {
        return match ($this->route()?->getName()) {
            'admin.schools.store', 'admin.schools.update' => [
                'name' => ['required', 'string', 'max:255'],
                'code' => ['required', 'string', 'max:20'],
                'description' => ['nullable', 'string'],
            ],
            'admin.departments.store', 'admin.departments.update' => [
                'school_id' => ['required', 'exists:schools,id'],
                'name' => ['required', 'string', 'max:255'],
                'code' => ['required', 'string', 'max:20'],
            ],
            'admin.programmes.store', 'admin.programmes.update' => [
                'department_id' => ['required', 'exists:departments,id'],
                'name' => ['required', 'string', 'max:255'],
                'duration_years' => ['required', 'integer', 'min:1', 'max:6'],
            ],
            'admin.graduation-years.store', 'admin.graduation-years.update' => [
                'year' => ['required', 'integer', 'digits:4'],
                'label' => ['nullable', 'string', 'max:20'],
            ],
            default => [],
        };
    }
}
