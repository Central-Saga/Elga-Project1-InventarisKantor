<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReturnAssetLoanRequest;
use App\Http\Requests\StoreAssetLoanRequest;
use App\Http\Requests\UpdateLoanStatusRequest;
use App\Http\Resources\AssetLoanResource;
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

    public function store(StoreAssetLoanRequest $request)
    {
        $loan = $this->loans->create($request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan peminjaman aset berhasil dikirim.',
            'data' => $loan,
        ], 201);
    }

    public function updateStatus(UpdateLoanStatusRequest $request, int $id)
    {
        Gate::authorize('approve', $this->loans->find($id));
        $loan = $this->loans->updateStatus($id, $request->validated()['status']);

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
