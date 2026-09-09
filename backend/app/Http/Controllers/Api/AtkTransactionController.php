<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AtkTransaction;
use App\Models\Atk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AtkTransactionController extends Controller
{
    public function index()
    {
        $transactions = AtkTransaction::with('atk')->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $transactions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'atk_id'                => 'required|exists:atks,id',
            'type'                  => 'required|in:in,out',
            'qty'                   => 'required|integer|min:1',
            'recipient_or_supplier' => 'required|string|max:255',
            'notes'                 => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $atk = Atk::findOrFail($validated['atk_id']);

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