<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AtkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_code' => $this->item_code,
            'name' => $this->name,
            'unit' => $this->unit,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
        ];
    }
}