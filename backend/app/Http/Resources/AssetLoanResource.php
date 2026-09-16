<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetLoanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'borrower_name' => $this->borrower_name,
            'loan_date' => $this->loan_date?->toIso8601String(), // Format ISO
            'expected_return_date' => $this->expected_return_date?->toIso8601String(), // Format ISO
            'return_date' => $this->return_date?->toIso8601String(), // Format ISO
            'return_condition' => $this->return_condition,
            'status' => $this->status, // Status badge peminjaman
            'notes' => $this->notes,
            
            // Menyertakan relasi Asset (yang di dalamnya juga bisa memuat kategori)
            'asset' => new AssetResource($this->whenLoaded('asset')),
            
            // Menyertakan relasi User jika ada
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
        ];
    }
}