<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobPostingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by JobPostingPolicy in the controller
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'salary_range' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'job_type' => ['required', 'in:full_time,part_time,internship,contract'],
            'apply_link' => ['nullable', 'url', 'max:255'],
            'deadline_at' => ['nullable', 'date', 'after:today'],
            'status' => ['sometimes', 'in:open,closed'],
        ];
    }
}
