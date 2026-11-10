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
        private readonly ActivityLogService $activityLog,
    ) {}

    public function paginate(int $perPage): LengthAwarePaginator
    {
        return $this->atks->paginate($perPage);
    }

    public function create(array $attributes): Atk
    {
        $attributes['item_code'] = $this->codes->nextAtkCode();

        $atk = $this->atks->create($attributes);
        $this->activityLog->record('atk.created', Atk::class, $atk->id, $attributes);

        return $atk;
    }

    public function update(int $id, array $attributes): Atk
    {
        return DB::transaction(function () use ($id, $attributes): Atk {
            $atk = $this->atks->findForUpdate($id);
            $atk->fill($attributes);
            $this->atks->save($atk);
            $this->activityLog->record('atk.updated', Atk::class, $atk->id, [
                'before' => $atk->getOriginal(),
                'after' => $attributes,
            ]);

            return $atk;
        });
    }

    public function delete(int $id): void
    {
        $atk = $this->atks->find($id);
        $this->atks->delete($atk);
        $this->activityLog->record('atk.deleted', Atk::class, $atk->id, [
            'name' => $atk->name,
            'item_code' => $atk->item_code,
        ]);
    }
}
