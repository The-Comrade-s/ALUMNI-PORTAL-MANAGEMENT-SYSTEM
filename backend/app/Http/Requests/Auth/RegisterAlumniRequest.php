<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterAlumniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public registration endpoint
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'matric_number' => ['required', 'string', 'max:50', 'unique:alumni_profiles,matric_number'],
            'school_id' => ['required', 'exists:schools,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'programme_id' => ['required', 'exists:programmes,id'],
            'graduation_year_id' => ['required', 'exists:graduation_years,id'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ];
    }
}
