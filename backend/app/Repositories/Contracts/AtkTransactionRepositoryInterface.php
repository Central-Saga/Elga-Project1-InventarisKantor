<?php

namespace App\Repositories\Contracts;

use App\Models\AtkTransaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AtkTransactionRepositoryInterface
{
    public function paginateWithAtk(int $perPage): LengthAwarePaginator;

    public function create(array $attributes): AtkTransaction;

    public function allWithAtks(): Collection;
}
