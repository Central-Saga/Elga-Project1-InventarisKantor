<?php

namespace App\Services;

use App\Models\AtkRequest;
use App\Models\User;
use App\Repositories\Contracts\AtkRepositoryInterface;
use App\Repositories\Contracts\AtkRequestRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AtkRequestService
{
    public function __construct(
        private readonly AtkRepositoryInterface $atks,
        private readonly AtkRequestRepositoryInterface $requests,
    ) {}

    public function paginate(?int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->requests->paginateForUser($userId, $perPage);
    }

    public function create(array $attributes, User $user): AtkRequest
    {
        return DB::transaction(function () use ($attributes, $user): AtkRequest {
            $atk = $this->atks->findForUpdate($attributes['atk_id']);
            if ($atk->stock < $attributes['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => ['Stok ATK tidak mencukupi. Stok tersedia: '.$atk->stock],
                ]);
            }

            $this->atks->adjustStock($atk, -$attributes['quantity']);

            return $this->requests->create([
                ...$attributes,
                'user_id' => $user->id,
                'borrower_name' => $user->name,
                'status' => 'pending',
            ]);
        });
    }

    public function updateStatus(int $id, string $status): AtkRequest
    {
        return DB::transaction(function () use ($id, $status): AtkRequest {
            $request = $this->requests->findForUpdate($id);
            if ($request->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => ['Permintaan ini sudah diproses.'],
                ]);
            }

            if ($status === 'rejected') {
                $atk = $this->atks->findForUpdate($request->atk_id);
                $this->atks->adjustStock($atk, $request->quantity);
            }

            $request->status = $status;
            $this->requests->save($request);

            return $request;
        });
    }
}
