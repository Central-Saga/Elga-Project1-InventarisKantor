<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Atk;
use Illuminate\Http\Request;

class AtkController extends Controller
{
    // Menampilkan daftar seluruh ATK
    public function index()
    {
        $atks = Atk::latest()->get();
        return response()->json([
            'success' => true,
            'data'    => $atks
        ]);
    }

    // Input / Menambah ATK baru ke sistem
    public function store(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat menambahkan ATK.');

        $validated = $request->validate([
            'item_code' => 'required|string|max:255|unique:atks,item_code',
            'name'      => 'required|string|max:255',
            'stock'     => 'required|integer|min:0',
            'unit'      => 'required|string|max:50',
            'min_stock' => 'nullable|integer|min:0',
        ]);

        $atk = Atk::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'ATK baru berhasil ditambahkan.',
            'data'    => $atk
        ], 201);
    }

    // Menambah stok ATK yang sudah ada
    public function addStock(Request $request, $id)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat menambah stok ATK.');

        $validated = $request->validate([
            'additional_stock' => 'required|integer|min:1',
        ]);

        $atk = Atk::findOrFail($id);
        
        // Tambahkan stok lama dengan stok tambahan
        $atk->stock += $validated['additional_stock'];
        $atk->save();

        return response()->json([
            'success' => true,
            'message' => 'Stok ATK berhasil ditambahkan.',
            'data'    => $atk
        ]);
    }
}