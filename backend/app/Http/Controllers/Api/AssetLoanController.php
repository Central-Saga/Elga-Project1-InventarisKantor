<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReturnAssetLoanRequest;
use App\Models\Asset;
use App\Models\AssetLoan;
use App\Rules\AssetIsAvailableRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AssetLoanController extends Controller
{
    public function index()
    {
        $query = AssetLoan::with(['asset', 'user'])->latest();
        if (Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }

        $perPage = min(max((int) request('per_page', 15), 1), 100);
        $loans = $query->paginate($perPage);
        return response()->json([
            'success' => true,
            'data'    => $loans->items(),
            'meta'    => [
                'current_page' => $loans->currentPage(),
                'last_page' => $loans->lastPage(),
                'per_page' => $loans->perPage(),
                'total' => $loans->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'asset_id'             => ['required', 'exists:assets,id', new AssetIsAvailableRule()],
            'loan_date'            => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:loan_date',
            'notes'                => 'nullable|string',
        ]);

        $validated['user_id']       = $user->id;
        $validated['borrower_name'] = $user->name;
        $validated['status']        = 'pending';

        $loan = DB::transaction(function () use ($validated) {
            $asset = Asset::whereKey($validated['asset_id'])->lockForUpdate()->firstOrFail();
            if ($asset->status !== 'available') {
                return null;
            }

            $asset->decrement('stock');
            if ($asset->stock <= 0) {
                $asset->update(['status' => 'borrowed']);
            }

            return AssetLoan::create($validated);
        });

        if (! $loan) {
            return response()->json([
                'success' => false,
                'message' => 'Aset sedang tidak tersedia untuk dipinjam.'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan peminjaman aset berhasil dikirim.',
            'data'    => $loan
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $loan = AssetLoan::with(['asset', 'user'])->lockForUpdate()->findOrFail($id);
            Gate::forUser(Auth::user())->authorize('approve', $loan);
            if ($loan->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Permintaan ini sudah diproses.'], 422);
            }

            if ($validated['status'] === 'approved') {
                $loan->asset->update(['status' => $loan->asset->stock > 0 ? 'available' : 'borrowed']);
            } else {
                $loan->asset->increment('stock');
                $loan->asset->update(['status' => 'available']);
            }

            $loan->update(['status' => $validated['status']]);

            return response()->json([
                'success' => true,
                'message' => 'Status permintaan berhasil diperbarui.',
                'data' => $loan->fresh(['asset', 'user']),
            ]);
        });
    }

    public function requestReturn($id)
    {
        return DB::transaction(function () use ($id) {
            $loan = AssetLoan::with('asset')->lockForUpdate()->findOrFail($id);

            abort_unless(
                Auth::user()->role !== 'admin' && $loan->user_id === Auth::id(),
                403,
                'Hanya peminjam yang dapat mengajukan pengembalian.'
            );

            if (! in_array($loan->status, ['approved', 'borrowed'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengajuan pengembalian tidak dapat dibuat untuk status ini.'
                ], 422);
            }

            $loan->update(['status' => 'return_requested']);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan pengembalian dikirim. Menunggu konfirmasi admin.',
                'data' => $loan->fresh(['asset', 'user'])
            ]);
        });
    }

    public function returnAsset(ReturnAssetLoanRequest $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $loan = AssetLoan::with(['asset', 'user'])->lockForUpdate()->findOrFail($id);

            $isAdminOwnedLoan = $loan->user?->role === 'admin';
            if ($loan->status !== 'return_requested' && ! $isAdminOwnedLoan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aset harus diajukan pengembaliannya oleh peminjam terlebih dahulu.'
                ], 422);
            }

            $loan->update([
                'status'      => 'returned',
                'return_date' => now()->format('Y-m-d'),
                'return_condition' => $request->validated()['return_condition'],
            ]);

            if ($loan->asset) {
                $loan->asset->increment('stock');
                $loan->asset->update(['status' => 'available']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Aset berhasil dikembalikan.',
                'data'    => $loan->fresh(['asset', 'user'])
            ]);
        });
    }
}