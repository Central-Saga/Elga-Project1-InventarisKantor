<?php

namespace App\Repositories\Contracts;

use App\Models\AssetLoan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AssetLoanRepositoryInterface
{
    public function paginateForUser(?int $userId, int $perPage): LengthAwarePaginator;

    public function find(int $id): AssetLoan;

    public function findForUpdate(int $id): AssetLoan;

    public function create(array $attributes): AssetLoan;

    public function save(AssetLoan $loan): void;

    public function freshWithRelations(AssetLoan $loan): AssetLoan;

    public function allWithAssets(): Collection;
}
