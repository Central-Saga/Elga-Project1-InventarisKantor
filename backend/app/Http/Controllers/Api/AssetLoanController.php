<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReturnAssetLoanRequest;
use App\Rules\AssetIsAvailableRule;
use App\Services\AssetLoanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AssetLoanController extends Controller
{
    public function __construct(private readonly AssetLoanService $loans) {}

    public function index()
    {
        $userId = request()->user()->role === 'admin' ? null : request()->user()->id;
        $loans = $this->loans->paginate($userId, min(max((int) request('per_page', 15), 1), 100));

        return response()->json([
            'success' => true,
            'data' => $loans->items(),
            'meta' => [
                'current_page' => $loans->currentPage(),
                'last_page' => $loans->lastPage(),
                'per_page' => $loans->perPage(),
                'total' => $loans->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => ['required', 'exists:assets,id', new AssetIsAvailableRule],
            'loan_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:loan_date',
            'notes' => 'nullable|string',
        ]);
        $loan = $this->loans->create($validated, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan peminjaman aset berhasil dikirim.',
            'data' => $loan,
        ], 201);
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate(['status' => 'required|in:approved,rejected']);
        Gate::authorize('approve', $this->loans->find($id));
        $loan = $this->loans->updateStatus($id, $validated['status']);

        return response()->json([
            'success' => true,
            'message' => 'Status permintaan berhasil diperbarui.',
            'data' => $loan,
        ]);
    }

    public function requestReturn(int $id)
    {
        Gate::authorize('requestReturn', $this->loans->find($id));
        $loan = $this->loans->requestReturn($id);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan pengembalian dikirim. Menunggu konfirmasi admin.',
            'data' => $loan,
        ]);
    }

    public function returnAsset(ReturnAssetLoanRequest $request, int $id)
    {
        $loan = $this->loans->find($id);
        Gate::authorize('confirmReturn', $loan);
        $updated = $this->loans->returnAsset(
            $id,
            $request->validated()['return_condition'],
            $loan->user?->role === 'admin',
        );

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil dikembalikan.',
            'data' => $updated,
        ]);
    }
}
