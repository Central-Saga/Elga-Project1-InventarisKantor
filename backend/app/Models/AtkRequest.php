<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class AtkRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'borrower_name',
        'requester_name',
        'user_id',
        'atk_id',
        'atk_item_name',
        'quantity',
        'reason',
        'notes',
        'status',
    ];

    public function atk()
    {
        return $this->belongsTo(Atk::class, 'atk_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}