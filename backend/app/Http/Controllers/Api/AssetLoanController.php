<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetLoan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AssetLoanController extends Controller
{
    public function index()
    {
        $query = AssetLoan::with(['asset', 'user'])->latest();
        if (Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }

        $loans = $query->get();
        return response()->json([
            'success' => true,
            'data'    => $loans
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'asset_id'             => 'required|exists:assets,id',
            'loan_date'            => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:loan_date',
            'notes'                => 'nullable|string',
        ]);

        $asset = Asset::findOrFail($validated['asset_id']);
        if ($asset->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Aset sedang tidak tersedia untuk dipinjam.'
            ], 422);
        }

        $validated['user_id']       = $user->id;
        $validated['borrower_name'] = $user->name;
        $validated['status']        = 'pending';

        $loan = AssetLoan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan peminjaman aset berhasil dikirim.',
            'data'    => $loan
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        abort_unless(Auth::user()->role === 'admin', 403, 'Hanya admin yang dapat memproses permintaan.');

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $loan = AssetLoan::with('asset')->lockForUpdate()->findOrFail($id);
            if ($loan->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Permintaan ini sudah diproses.'], 422);
            }

            if ($validated['status'] === 'approved') {
                if ($loan->asset->status !== 'available') {
                    return response()->json(['success' => false, 'message' => 'Aset sudah tidak tersedia.'], 422);
                }

                $loan->asset->update(['status' => 'borrowed']);
            }

            $loan->update(['status' => $validated['status']]);

            return response()->json([
                'success' => true,
                'message' => 'Status permintaan berhasil diperbarui.',
                'data' => $loan->fresh(['asset', 'user']),
            ]);
        });
    }

    public function returnAsset($id)
    {
        $loan = AssetLoan::findOrFail($id);

        if ($loan->status === 'returned') {
            return response()->json([
                'success' => false,
                'message' => 'Aset ini sudah dikembalikan sebelumnya.'
            ], 422);
        }

        $loan->update([
            'status'      => 'returned',
            'return_date' => now()->format('Y-m-d'),
        ]);

        if ($loan->asset) {
            $loan->asset->update(['status' => 'available']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil dikembalikan.',
            'data'    => $loan
        ]);
    }
}