<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AtkRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrower_name',
        'requester_name',
        'atk_id',
        'quantity',
        'notes',
    ];

    // Tambahkan method relasi ini
    public function atk()
    {
        return $this->belongsTo(Atk::class, 'atk_id');
    }
}
