<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AtkRequest;
use App\Models\AtkTransaction;
use App\Models\AssetLoan;
use Illuminate\Http\Request;

class TransactionHistoryController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat melihat riwayat transaksi.');

        $atkRequests = AtkRequest::with('atk')->latest()->get()->map(function (AtkRequest $item) {
            return [
                'id' => 'atk-request-' . $item->id,
                'category' => 'ATK',
                'action' => 'Pengambilan ATK',
                'item_name' => $item->atk?->name ?? 'ATK #' . $item->atk_id,
                'item_code' => $item->atk?->item_code,
                'person' => $item->borrower_name,
                'quantity' => $item->quantity,
                'unit' => $item->atk?->unit,
                'transaction_date' => $item->created_at?->toDateString(),
                'expected_return_date' => null,
                'return_date' => null,
                'status' => $item->status,
                'notes' => $item->notes,
            ];
        });

        $atkTransactions = AtkTransaction::with('atk')->latest()->get()->map(function (AtkTransaction $item) {
            return [
                'id' => 'atk-transaction-' . $item->id,
                'category' => 'ATK',
                'action' => $item->type === 'in' ? 'Stok Masuk' : 'Stok Keluar',
                'item_name' => $item->atk?->name ?? 'ATK #' . $item->atk_id,
                'item_code' => $item->atk?->item_code,
                'person' => $item->recipient_or_supplier,
                'quantity' => $item->qty,
                'unit' => $item->atk?->unit,
                'transaction_date' => $item->created_at?->toDateString(),
                'expected_return_date' => null,
                'return_date' => null,
                'status' => $item->type,
                'notes' => $item->notes,
            ];
        });

        $assetLoans = AssetLoan::with('asset')->latest()->get()->map(function (AssetLoan $item) {
            return [
                'id' => 'asset-loan-' . $item->id,
                'category' => 'Aset',
                'action' => 'Peminjaman Aset',
                'item_name' => $item->asset?->name ?? 'Aset #' . $item->asset_id,
                'item_code' => $item->asset?->asset_code,
                'person' => $item->borrower_name,
                'quantity' => 1,
                'unit' => 'Unit',
                'transaction_date' => $item->loan_date?->toDateString(),
                'expected_return_date' => $item->expected_return_date?->toDateString(),
                'return_date' => $item->return_date?->toDateString(),
                'status' => $item->status,
                'notes' => $item->notes,
            ];
        });

        $history = $atkRequests
            ->concat($atkTransactions)
            ->concat($assetLoans)
            ->sortByDesc('transaction_date')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $history,
            'meta' => ['total' => $history->count()],
        ]);
    }
}