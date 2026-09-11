<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AtkRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AtkRequestController extends Controller
{
    public function index()
    {
        $requests = AtkRequest::with(['atk', 'user'])->latest()->get();
        return response()->json([
            'success' => true,
            'data'    => $requests
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'atk_id'   => 'required|exists:atks,id',
            'quantity' => 'required|integer|min:1',
            'notes'    => 'nullable|string',
        ]);

        $validated['user_id']       = $user->id;
        $validated['borrower_name'] = $user->name;
        $validated['status']        = 'pending';

        $atkRequest = AtkRequest::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan ATK berhasil dikirim.',
            'data'    => $atkRequest
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $atkRequest = AtkRequest::findOrFail($id);
        $atkRequest->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Status permintaan ATK berhasil diperbarui.',
            'data'    => $atkRequest
        ]);
    }
}