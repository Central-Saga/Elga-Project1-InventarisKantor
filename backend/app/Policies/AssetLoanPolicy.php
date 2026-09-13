<?php

namespace App\Policies;

use App\Models\AssetLoan;
use App\Models\User;

class AssetLoanPolicy
{
    public function approve(User $user, AssetLoan $loan): bool
    {
        return $user->role === 'admin';
    }
}