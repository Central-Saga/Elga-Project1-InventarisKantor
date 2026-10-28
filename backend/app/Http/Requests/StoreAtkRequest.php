<?php

namespace App\Http\Requests;

use App\Models\Atk;
use Illuminate\Foundation\Http\FormRequest;

class StoreAtkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Atk::class) ?? false;
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