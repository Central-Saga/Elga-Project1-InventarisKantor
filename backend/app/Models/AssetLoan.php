<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetLoan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'asset_id',
        'user_id',
        'borrower_name',
        'loan_date',
        'expected_return_date',
        'return_date',
        'return_condition',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'loan_date' => 'date',
            'expected_return_date' => 'date',
            'return_date' => 'date',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}