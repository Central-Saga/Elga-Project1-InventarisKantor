<?php

namespace App\Http\Requests;

use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Asset::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255', 'unique:assets,serial_number'],
            'category_id' => ['required', 'exists:categories,id'],
            'condition' => ['required', 'in:good,maintenance,damaged'],
            'status' => ['sometimes', 'in:available,borrowed,disposed'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}