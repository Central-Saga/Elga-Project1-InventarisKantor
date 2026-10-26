<?php

namespace App\Services;

use App\Exceptions\InsufficientAtkStockException;
use App\Models\Atk;
use App\Models\AtkTransaction;
use App\Repositories\Contracts\AtkRepositoryInterface;
use App\Repositories\Contracts\AtkTransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AtkStockService
{
    public function __construct(
        private readonly AtkRepositoryInterface $atks,
        private readonly AtkTransactionRepositoryInterface $transactions,
    ) {}

    public function paginateTransactions(int $perPage): LengthAwarePaginator
    {
        return $this->transactions->paginateWithAtk($perPage);
    }

    public function addStock(int $atkId, int $amount): Atk
    {
        return DB::transaction(function () use ($atkId, $amount): Atk {
            $atk = $this->atks->findForUpdate($atkId);
            $this->atks->adjustStock($atk, $amount);

            return $this->atks->find($atkId);
        });
    }

    public function recordTransaction(array $attributes): AtkTransaction
    {
        return DB::transaction(function () use ($attributes): AtkTransaction {
            $atk = $this->atks->findForUpdate($attributes['atk_id']);
            $quantity = $attributes['qty'];

            if ($attributes['type'] === 'out' && $atk->stock < $quantity) {
                throw new InsufficientAtkStockException($atk->stock);
            }

            $amount = $attributes['type'] === 'out' ? -$quantity : $quantity;
            $this->atks->adjustStock($atk, $amount);

            return $this->transactions->create($attributes);
        });
    }
}
