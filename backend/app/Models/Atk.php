<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Atk extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_code',
        'name',
        'unit',
        'stock',
        'min_stock',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'min_stock' => 'integer',
        ];
    }

    public function transactions()
    {
        return $this->hasMany(AtkTransaction::class);
    }
}