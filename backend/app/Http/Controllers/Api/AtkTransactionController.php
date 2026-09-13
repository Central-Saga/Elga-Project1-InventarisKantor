<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAtkTransactionRequest;
use App\Models\AtkTransaction;
use App\Models\Atk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AtkTransactionController extends Controller
{
    public function index()
    {
        $perPage = min(max((int) request('per_page', 15), 1), 100);
        $transactions = AtkTransaction::with('atk')->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $transactions->items(),
            'meta'    => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function store(StoreAtkTransactionRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $atk = Atk::whereKey($validated['atk_id'])->lockForUpdate()->firstOrFail();

            // Jika stok keluar, cek ketersediaan stok
            if ($validated['type'] === 'out') {
                if ($atk->stock < $validated['qty']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok tidak mencukupi! Stok saat ini: ' . $atk->stock
                    ], 400);
                }
                // Potong stok
                $atk->decrement('stock', $validated['qty']);
            } else {
                // Tambah stok (jika barang masuk)
                $atk->increment('stock', $validated['qty']);
            }

            // Catat riwayat transaksi
            $transaction = AtkTransaction::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi ATK berhasil dicatat',
                'data'    => $transaction->load('atk')
            ], 201);
        });
    }
}