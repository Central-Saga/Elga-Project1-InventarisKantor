<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'asset_code',
        'code',
        'name',
        'brand',
        'serial_number',
        'condition',
        'status',
        'stock',
        'purchase_date',
        'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'stock' => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}