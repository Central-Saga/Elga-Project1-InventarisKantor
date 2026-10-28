<?php

namespace App\Http\Requests;

use App\Models\Atk;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAtkRequest extends FormRequest
{
    public function authorize(): bool
    {
        $atk = Atk::findOrFail($this->route('atk') ?? $this->route('id'));

        return $this->user()?->can('update', $atk) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'stock' => ['required', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
