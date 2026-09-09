<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'asset_code',
        'name',
        'brand',
        'serial_number',
        'condition',
        'status',
        'purchase_date',
        'purchase_price',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}