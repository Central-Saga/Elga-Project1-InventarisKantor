<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetLoan;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetLoanController extends Controller
{
    public function index()
    {
        $loans = AssetLoan::with(['asset', 'user'])->latest()->get();
        
        return response()->json([
            'success' => true,
            'data'    => $loans
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id'    => 'required|exists:assets,id',
            'borrower_name' => 'required|string|max:255',
            'loan_date'   => 'required|date',
            'return_date' => 'nullable|date|after_or_equal:loan_date',
            'notes'       => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $asset = Asset::findOrFail($validated['asset_id']);

            if ($asset->status !== 'available') {
                return response()->json([
                    'success' => false,
                    'message' => 'Aset sedang tidak tersedia untuk dipinjam'
                ], 400);
            }

            // Catat Peminjaman
            $loan = AssetLoan::create(array_merge($validated, [
                'status' => 'borrowed'
            ]));

            // Update status Aset jadi dipinjam
            $asset->update(['status' => 'borrowed']);

            return response()->json([
                'success' => true,
                'message' => 'Peminjaman aset berhasil dicatat',
                'data'    => $loan
            ], 201);
        });
    }

    public function returnAsset($id)
    {
        $loan = AssetLoan::findOrFail($id);

        if ($loan->status === 'returned') {
            return response()->json([
                'success' => false,
                'message' => 'Aset ini sudah dikembalikan sebelumnya'
            ], 400);
        }

        return DB::transaction(function () use ($loan) {
            $loan->update([
                'status' => 'returned',
                'actual_return_date' => now(),
            ]);

            // Kembalikan status Aset jadi available
            $asset = Asset::findOrFail($loan->asset_id);
            $asset->update(['status' => 'available']);

            return response()->json([
                'success' => true,
                'message' => 'Pengembalian aset berhasil diproses',
                'data'    => $loan
            ]);
        });
    }
}