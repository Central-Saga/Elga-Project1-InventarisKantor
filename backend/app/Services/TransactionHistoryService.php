<?php

namespace App\Services;

use App\Models\AssetLoan;
use App\Models\AtkRequest;
use App\Models\AtkTransaction;
use App\Repositories\Contracts\AssetLoanRepositoryInterface;
use App\Repositories\Contracts\AtkRequestRepositoryInterface;
use App\Repositories\Contracts\AtkTransactionRepositoryInterface;

class TransactionHistoryService
{
    public function __construct(
        private readonly AssetLoanRepositoryInterface $loans,
        private readonly AtkRequestRepositoryInterface $requests,
        private readonly AtkTransactionRepositoryInterface $transactions,
    ) {}

    public function all(): array
    {
        $atkRequests = $this->requests->allWithAtks()->map(
            fn (AtkRequest $item): array => [
                'id' => 'atk-request-'.$item->id,
                'category' => 'ATK',
                'action' => 'Pengambilan ATK',
                'item_name' => $item->atk?->name ?? 'ATK #'.$item->atk_id,
                'item_code' => $item->atk?->item_code,
                'person' => $item->borrower_name,
                'quantity' => $item->quantity,
                'unit' => $item->atk?->unit,
                'transaction_date' => $item->created_at?->toDateString(),
                'expected_return_date' => null,
                'return_date' => null,
                'status' => $item->status,
                'notes' => $item->notes,
            ],
        );

        $atkTransactions = $this->transactions->allWithAtks()->map(
            fn (AtkTransaction $item): array => [
                'id' => 'atk-transaction-'.$item->id,
                'category' => 'ATK',
                'action' => $item->type === 'in' ? 'Stok Masuk' : 'Stok Keluar',
                'item_name' => $item->atk?->name ?? 'ATK #'.$item->atk_id,
                'item_code' => $item->atk?->item_code,
                'person' => $item->recipient_or_supplier,
                'quantity' => $item->qty,
                'unit' => $item->atk?->unit,
                'transaction_date' => $item->created_at?->toDateString(),
                'expected_return_date' => null,
                'return_date' => null,
                'status' => $item->type,
                'notes' => $item->notes,
            ],
        );

        $assetLoans = $this->loans->allWithAssets()->map(
            fn (AssetLoan $item): array => [
                'id' => 'asset-loan-'.$item->id,
                'category' => 'Aset',
                'action' => 'Peminjaman Aset',
                'item_name' => $item->asset?->name ?? 'Aset #'.$item->asset_id,
                'item_code' => $item->asset?->asset_code,
                'person' => $item->borrower_name,
                'quantity' => 1,
                'unit' => 'Unit',
                'transaction_date' => $item->loan_date?->toDateString(),
                'expected_return_date' => $item->expected_return_date?->toDateString(),
                'return_date' => $item->return_date?->toDateString(),
                'status' => $item->status,
                'notes' => $item->notes,
            ],
        );

        return $atkRequests
            ->concat($atkTransactions)
            ->concat($assetLoans)
            ->sortByDesc('transaction_date')
            ->values()
            ->all();
    }
}
