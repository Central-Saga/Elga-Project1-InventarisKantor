<?php

namespace App\Repositories\Eloquent;

use App\Models\AtkRequest;
use App\Repositories\Contracts\AtkRequestRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentAtkRequestRepository implements AtkRequestRepositoryInterface
{
    public function paginateForUser(?int $userId, int $perPage): LengthAwarePaginator
    {
        $query = AtkRequest::with(['atk', 'user'])->latest();
        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return $query->paginate($perPage);
    }

    public function findForUpdate(int $id): AtkRequest
    {
        return AtkRequest::with(['atk', 'user'])->lockForUpdate()->findOrFail($id);
    }

    public function create(array $attributes): AtkRequest
    {
        return AtkRequest::create($attributes);
    }

    public function save(AtkRequest $request): void
    {
        $request->save();
    }

    public function allWithAtks(): Collection
    {
        return AtkRequest::with('atk')->latest()->get();
    }
}
