<?php

namespace App\Repositories\Contracts;

use App\Models\Atk;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AtkRepositoryInterface
{
    public function paginate(int $perPage): LengthAwarePaginator;

    public function find(int $id): Atk;

    public function findForUpdate(int $id): Atk;

    public function create(array $attributes): Atk;

    public function save(Atk $atk): void;

    public function delete(Atk $atk): void;

    public function adjustStock(Atk $atk, int $amount): void;

    public function codeExists(string $code): bool;
}
