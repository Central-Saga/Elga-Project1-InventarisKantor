<?php

namespace App\Http\Requests;

use App\Rules\AssetIsAvailableRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAssetLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => ['required', 'exists:assets,id', new AssetIsAvailableRule],
            'loan_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:loan_date',
            'notes' => 'nullable|string',
        ];
    }
}

