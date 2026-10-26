<?php

namespace App\Repositories\Contracts;

use App\Models\AtkRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AtkRequestRepositoryInterface
{
    public function paginateForUser(?int $userId, int $perPage): LengthAwarePaginator;

    public function findForUpdate(int $id): AtkRequest;

    public function create(array $attributes): AtkRequest;

    public function save(AtkRequest $request): void;

    public function allWithAtks(): Collection;
}
