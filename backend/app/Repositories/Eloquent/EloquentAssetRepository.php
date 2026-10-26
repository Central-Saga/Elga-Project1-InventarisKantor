<?php

namespace App\Repositories\Eloquent;

use App\Models\Asset;
use App\Repositories\Contracts\AssetRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentAssetRepository implements AssetRepositoryInterface
{
    public function paginateWithCategory(int $perPage): LengthAwarePaginator
    {
        return Asset::with('category')->latest()->paginate($perPage);
    }

    public function find(int $id): Asset
    {
        return Asset::with('category')->findOrFail($id);
    }

    public function loadCategory(Asset $asset): Asset
    {
        return $asset->load('category');
    }

    public function findForUpdate(int $id): Asset
    {
        return Asset::whereKey($id)->lockForUpdate()->firstOrFail();
    }

    public function create(array $attributes): Asset
    {
        return Asset::create($attributes);
    }

    public function save(Asset $asset): void
    {
        $asset->save();
    }

    public function delete(Asset $asset): void
    {
        $asset->delete();
    }

    public function adjustStock(Asset $asset, int $amount): void
    {
        if ($amount > 0) {
            Asset::whereKey($asset->getKey())->increment('stock', $amount);
        } elseif ($amount < 0) {
            Asset::whereKey($asset->getKey())->decrement('stock', abs($amount));
        }

        $asset->stock = (int) $asset->stock + $amount;
    }

    public function codeExists(string $code): bool
    {
        return Asset::withTrashed()->where('asset_code', $code)->exists();
    }
}
