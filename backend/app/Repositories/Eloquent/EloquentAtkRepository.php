<?php

namespace App\Repositories\Eloquent;

use App\Models\Atk;
use App\Repositories\Contracts\AtkRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentAtkRepository implements AtkRepositoryInterface
{
    public function paginate(int $perPage): LengthAwarePaginator
    {
        return Atk::latest()->paginate($perPage);
    }

    public function find(int $id): Atk
    {
        return Atk::findOrFail($id);
    }

    public function findForUpdate(int $id): Atk
    {
        return Atk::whereKey($id)->lockForUpdate()->firstOrFail();
    }

    public function create(array $attributes): Atk
    {
        return Atk::create($attributes);
    }

    public function save(Atk $atk): void
    {
        $atk->save();
    }

    public function delete(Atk $atk): void
    {
        $atk->delete();
    }

    public function adjustStock(Atk $atk, int $amount): void
    {
        if ($amount > 0) {
            Atk::whereKey($atk->getKey())->increment('stock', $amount);
        } elseif ($amount < 0) {
            Atk::whereKey($atk->getKey())->decrement('stock', abs($amount));
        }

        $atk->stock = (int) $atk->stock + $amount;
    }

    public function codeExists(string $code): bool
    {
        return Atk::withTrashed()->where('item_code', $code)->exists();
    }
}
