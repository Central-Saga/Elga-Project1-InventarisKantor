<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AtkRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'borrower_name' => $this->borrower_name,
            'user_id' => $this->user_id,
            'atk_id' => $this->atk_id,
            'quantity' => $this->quantity,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'atk' => new AtkResource($this->whenLoaded('atk')),
        ];
    }
}

