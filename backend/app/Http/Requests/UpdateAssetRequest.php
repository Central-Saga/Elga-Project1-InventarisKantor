<?php

namespace App\Http\Requests;

use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        $asset = Asset::findOrFail($this->route('asset') ?? $this->route('id'));

        return $this->user()?->can('update', $asset) ?? false;
    }

    public function rules(): array
    {
        $assetId = $this->route('asset') ?? $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255', Rule::unique('assets', 'serial_number')->ignore($assetId)],
            'category_id' => ['required', 'exists:categories,id'],
            'condition' => ['required', 'in:good,maintenance,damaged'],
            'status' => ['required', 'in:available,borrowed,disposed'],
            'stock' => ['required', 'integer', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}