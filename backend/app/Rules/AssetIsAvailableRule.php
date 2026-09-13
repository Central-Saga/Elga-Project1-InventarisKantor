<?php

namespace App\Rules;

use App\Models\Asset;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AssetIsAvailableRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $asset = Asset::find($value);

        if (! $asset || $asset->status !== 'available' || $asset->stock < 1) {
            $fail('Aset sedang tidak tersedia untuk dipinjam.');
        }
    }
}