<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TransactionHistoryService;
use Illuminate\Http\Request;

class TransactionHistoryController extends Controller
{
    public function __construct(private readonly TransactionHistoryService $history) {}

    public function index(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat melihat riwayat transaksi.');

        $transactions = $this->history->all();

        return response()->json([
            'success' => true,
            'data' => $transactions,
            'meta' => ['total' => count($transactions)],
        ]);
    }
}
