<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAtkRequestRequest;
use App\Models\Atk;
use App\Models\AtkRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AtkRequestController extends Controller
{
    public function index()
    {
        $query = AtkRequest::with(['atk', 'user'])->latest();
        if (Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }

        $perPage = min(max((int) request('per_page', 15), 1), 100);
        $requests = $query->paginate($perPage);
        return response()->json([
            'success' => true,
            'data'    => $requests->items(),
            'meta'    => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function store(StoreAtkRequestRequest $request)
    {
        $user = Auth::user();

        $validated = $request->validated();

        $atkRequest = DB::transaction(function () use ($validated, $user) {
            $atk = Atk::lockForUpdate()->findOrFail($validated['atk_id']);

            if ($atk->stock < $validated['quantity']) {
                abort(422, 'Stok ATK tidak mencukupi. Stok tersedia: ' . $atk->stock);
            }

            $atk->decrement('stock', $validated['quantity']);

            return AtkRequest::create([
                ...$validated,
                'user_id' => $user->id,
                'borrower_name' => $user->name,
                'status' => 'pending',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Permintaan ATK berhasil dikirim.',
            'data'    => $atkRequest
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        abort_unless(Auth::user()->role === 'admin', 403, 'Hanya admin yang dapat memproses permintaan.');

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $atkRequest = DB::transaction(function () use ($validated, $id) {
            $atkRequest = AtkRequest::lockForUpdate()->findOrFail($id);
            if ($atkRequest->status !== 'pending') {
                abort(422, 'Permintaan ini sudah diproses.');
            }

            if ($validated['status'] === 'rejected') {
                Atk::whereKey($atkRequest->atk_id)
                    ->lockForUpdate()
                    ->increment('stock', $atkRequest->quantity);
            }

            $atkRequest->update(['status' => $validated['status']]);

            return $atkRequest;
        });

        return response()->json([
            'success' => true,
            'message' => 'Status permintaan ATK berhasil diperbarui.',
            'data'    => $atkRequest
        ]);
    }
}