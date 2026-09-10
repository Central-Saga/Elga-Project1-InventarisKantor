<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AtkRequest;
use App\Models\Atk;

class AtkRequestController extends Controller
{
    public function index()
    {
        return response()->json(AtkRequest::with('atk')->get());
    }

   public function store(Request $request)
{
    $validated = $request->validate([
        'borrower_name' => 'required|string',
        'atk_id' => 'required|exists:atks,id',
        'quantity' => 'required|integer|min:1',
        'notes' => 'nullable|string',
    ]);

    // Ambil data barang ATK berdasarkan ID
    $atk = Atk::find($request->atk_id);

    // Cek apakah stok mencukupi
    if ($atk->stock < $request->quantity) {
        return response()->json([
            'message' => "Stok tidak mencukupi! Stok saat ini untuk {$atk->name} tersisa {$atk->stock} {$atk->unit}."
        ], 422); // Status 422 Unprocessable Entity
    }

    // Jika stok cukup, simpan data permintaan ATK
    $atkRequest = AtkRequest::create($validated);

    // Kurangi stok barang secara otomatis
    $atk->stock -= $request->quantity;
    $atk->save();

    return response()->json([
        'message' => 'Permintaan berhasil dibuat dan stok diperbarui',
        'data' => $atkRequest
    ], 201);
}
}
