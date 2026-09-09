<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Atk extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'name',
        'unit',
        'stock',
        'min_stock',
    ];

    public function transactions()
    {
        return $table->hasMany(AtkTransaction::class);
    }
}