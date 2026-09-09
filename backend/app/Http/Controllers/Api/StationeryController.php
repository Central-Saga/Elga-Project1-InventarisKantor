<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stationery;
use Illuminate\Http\Request;

class StationeryController extends Controller
{
    public function index()
    {
        $stationeries = Stationery::with('category')->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $stationeries
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'item_code' => 'required|string|unique:stationeries,item_code',
            'name' => 'required|string|max:255',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'min_stock' => 'required|integer|min:0',
        ]);

        $stationery = Stationery::create($validated);
        return response()->json(['success' => true, 'data' => $stationery], 201);
    }

    public function show(Stationery $stationery)
    {
        return response()->json(['success' => true, 'data' => $stationery->load('category')]);
    }

    public function update(Request $request, Stationery $stationery)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'item_code' => 'sometimes|string|unique:stationeries,item_code,' . $stationery->id,
            'name' => 'sometimes|string|max:255',
            'stock' => 'sometimes|integer|min:0',
            'unit' => 'sometimes|string|max:50',
            'min_stock' => 'sometimes|integer|min:0',
        ]);

        $stationery->update($validated);
        return response()->json(['success' => true, 'data' => $stationery]);
    }

    public function destroy(Stationery $stationery)
    {
        $stationery->delete();
        return response()->json(['success' => true, 'message' => 'Stationery deleted']);
    }
}