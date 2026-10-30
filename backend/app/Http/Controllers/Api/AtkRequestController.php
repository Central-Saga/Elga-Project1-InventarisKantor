<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAtkRequestRequest;
use App\Http\Requests\UpdateAtkRequestStatusRequest;
use App\Services\AtkRequestService;
use Illuminate\Http\Request;

class AtkRequestController extends Controller
{
    public function __construct(private readonly AtkRequestService $requests) {}

    public function index()
    {
        $user = request()->user();
        $requests = $this->requests->paginate(
            $user->role === 'admin' ? null : $user->id,
            min(max((int) request('per_page', 15), 1), 100),
        );

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function store(StoreAtkRequestRequest $request)
    {
        $atkRequest = $this->requests->create($request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Permintaan ATK berhasil dikirim.',
            'data' => $atkRequest,
        ], 201);
    }

    public function updateStatus(UpdateAtkRequestStatusRequest $request, int $id)
    {
        $atkRequest = $this->requests->updateStatus($id, $request->validated()['status']);

        return response()->json([
            'success' => true,
            'message' => 'Status permintaan ATK berhasil diperbarui.',
            'data' => $atkRequest,
        ]);
    }
}
