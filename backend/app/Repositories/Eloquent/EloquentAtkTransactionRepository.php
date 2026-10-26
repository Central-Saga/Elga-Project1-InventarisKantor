<?php

namespace App\Repositories\Eloquent;

use App\Models\AtkTransaction;
use App\Repositories\Contracts\AtkTransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentAtkTransactionRepository implements AtkTransactionRepositoryInterface
{
    public function paginateWithAtk(int $perPage): LengthAwarePaginator
    {
        return AtkTransaction::with('atk')->latest()->paginate($perPage);
    }

    public function create(array $attributes): AtkTransaction
    {
        return AtkTransaction::create($attributes)->load('atk');
    }

    public function allWithAtks(): Collection
    {
        return AtkTransaction::with('atk')->latest()->get();
    }
}
