<?php

namespace App\Repositories\Eloquent;

use App\Models\AssetLoan;
use App\Repositories\Contracts\AssetLoanRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentAssetLoanRepository implements AssetLoanRepositoryInterface
{
    public function paginateForUser(?int $userId, int $perPage): LengthAwarePaginator
    {
        $query = AssetLoan::with(['asset', 'user'])->latest();
        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return $query->paginate($perPage);
    }

    public function find(int $id): AssetLoan
    {
        return AssetLoan::with(['asset', 'user'])->findOrFail($id);
    }

    public function findForUpdate(int $id): AssetLoan
    {
        return AssetLoan::with(['asset', 'user'])->lockForUpdate()->findOrFail($id);
    }

    public function create(array $attributes): AssetLoan
    {
        return AssetLoan::create($attributes);
    }

    public function save(AssetLoan $loan): void
    {
        $loan->save();
    }

    public function freshWithRelations(AssetLoan $loan): AssetLoan
    {
        return $loan->fresh(['asset', 'user']);
    }

    public function allWithAssets(): Collection
    {
        return AssetLoan::with('asset')->latest()->get();
    }
}
