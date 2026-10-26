<?php

namespace App\Repositories\Contracts;

use App\Models\Asset;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AssetRepositoryInterface
{
    public function paginateWithCategory(int $perPage): LengthAwarePaginator;

    public function find(int $id): Asset;

    public function loadCategory(Asset $asset): Asset;

    public function findForUpdate(int $id): Asset;

    public function create(array $attributes): Asset;

    public function save(Asset $asset): void;

    public function delete(Asset $asset): void;

    public function adjustStock(Asset $asset, int $amount): void;

    public function codeExists(string $code): bool;
}
