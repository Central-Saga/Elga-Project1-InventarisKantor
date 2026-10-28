<?php

namespace App\Policies;

use App\Models\Atk;
use App\Models\User;

class AtkPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Atk $atk): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Atk $atk): bool
    {
        return $user->role === 'admin';
    }
}
