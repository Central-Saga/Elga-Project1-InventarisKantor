<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AtkTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'atk_id',
        'type',
        'qty',
        'recipient_or_supplier',
        'notes',
    ];

    public function atk()
    {
        return $this->belongsTo(Atk::class);
    }
}