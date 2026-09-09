<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetLoan extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'borrower_name',
        'loan_date',
        'expected_return_date',
        'status',
        'notes',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}