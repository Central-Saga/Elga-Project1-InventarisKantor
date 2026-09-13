<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAtkTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'atk_id' => ['required', 'exists:atks,id'],
            'type' => ['required', 'in:in,out'],
            'qty' => ['required', 'integer', 'min:1'],
            'recipient_or_supplier' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }
}