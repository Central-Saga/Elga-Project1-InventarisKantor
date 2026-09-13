<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_code' => $this->asset_code,
            'name' => $this->name,
            'brand' => $this->brand,
            'serial_number' => $this->serial_number,
            'condition' => $this->condition,
            'status' => $this->status,
            'stock' => $this->stock,
            'purchase_date' => $this->purchase_date?->toDateString(),
            'photo_url' => $this->photo_path ? asset('storage/'.$this->photo_path) : null,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'type' => $this->category->type,
            ]),
        ];
    }
}