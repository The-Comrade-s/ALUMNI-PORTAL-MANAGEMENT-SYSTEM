<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'cover_image_url' => ['nullable', 'url'],
            'venue' => ['nullable', 'string', 'max:255'],
            'is_virtual' => ['sometimes', 'boolean'],
            'start_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date', 'after:start_at'],
            'registration_deadline' => ['nullable', 'date', 'before_or_equal:start_at'],
            'status' => ['sometimes', 'in:upcoming,ongoing,completed,cancelled'],
        ];
    }
}
