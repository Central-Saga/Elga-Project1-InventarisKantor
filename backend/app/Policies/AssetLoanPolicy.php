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

    public function requestReturn(User $user, AssetLoan $loan): bool
    {
        return $user->role !== 'admin' && $loan->user_id === $user->id;
    }

    public function confirmReturn(User $user, AssetLoan $loan): bool
    {
        return $user->role === 'admin';
    }
}
