<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InsufficientAtkStockException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAtkTransactionRequest;
use App\Services\AtkStockService;

class AtkTransactionController extends Controller
{
    public function __construct(private readonly AtkStockService $stock) {}

    public function index()
    {
        $transactions = $this->stock->paginateTransactions(min(max((int) request('per_page', 15), 1), 100));

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function store(StoreAtkTransactionRequest $request)
    {
        try {
            $transaction = $this->stock->recordTransaction($request->validated());
        } catch (InsufficientAtkStockException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
                'errors' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaksi ATK berhasil dicatat',
            'data' => $transaction,
        ], 201);
    }
}
