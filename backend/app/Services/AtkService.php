<?php

namespace App\Services;

use App\Models\Atk;
use App\Repositories\Contracts\AtkRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AtkService
{
    public function __construct(
        private readonly AtkRepositoryInterface $atks,
        private readonly AssetCodeGenerator $codes,
    ) {}

    public function paginate(int $perPage): LengthAwarePaginator
    {
        return $this->atks->paginate($perPage);
    }

    public function create(array $attributes): Atk
    {
        $attributes['item_code'] = $this->codes->nextAtkCode();

        return $this->atks->create($attributes);
    }

    public function update(int $id, array $attributes): Atk
    {
        return DB::transaction(function () use ($id, $attributes): Atk {
            $atk = $this->atks->findForUpdate($id);
            $atk->fill($attributes);
            $this->atks->save($atk);

            return $atk;
        });
    }

    public function delete(int $id): void
    {
        $this->atks->delete($this->atks->find($id));
    }
}
