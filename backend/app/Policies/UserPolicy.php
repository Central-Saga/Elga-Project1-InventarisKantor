<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $actor, User $target): bool
    {
        return $actor->role === 'admin';
    }

    public function delete(User $actor, User $target): bool
    {
        return $actor->role === 'admin';
    }
}
