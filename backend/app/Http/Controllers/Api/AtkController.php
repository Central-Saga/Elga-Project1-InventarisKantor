<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Atk;
use Illuminate\Http\Request;

class AtkController extends Controller
{
    public function index()
    {
        $atks = Atk::latest()->get();
        return response()->json([
            'success' => true,
            'data' => $atks
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'required|string|unique:atks,item_code',
            'name'      => 'required|string',
            'unit'      => 'required|string',
            'stock'     => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
        ]);

        $atk = Atk::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data ATK berhasil ditambahkan',
            'data'    => $atk
        ], 201);
    }

    public function show(Atk $atk)
    {
        return response()->json([
            'success' => true,
            'data'    => $atk
        ]);
    }

    public function update(Request $request, Atk $atk)
    {
        $validated = $request->validate([
            'item_code' => 'required|string|unique:atks,item_code,' . $atk->id,
            'name'      => 'required|string',
            'unit'      => 'required|string',
            'stock'     => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
        ]);

        $atk->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data ATK berhasil diubah',
            'data'    => $atk
        ]);
    }

    public function destroy(Atk $atk)
    {
        $atk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data ATK berhasil dihapus'
        ]);
    }
}