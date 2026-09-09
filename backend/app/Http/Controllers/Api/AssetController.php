<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::with('category')->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $assets
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'asset_code' => 'required|string|unique:assets,asset_code',
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'condition' => 'required|in:good,maintenance,damaged',
            'status' => 'required|in:available,borrowed,disposed',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric',
        ]);

        $asset = Asset::create($validated);
        return response()->json(['success' => true, 'data' => $asset], 201);
    }

    public function show(Asset $asset)
    {
        return response()->json(['success' => true, 'data' => $asset->load('category')]);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'asset_code' => 'sometimes|string|unique:assets,asset_code,' . $asset->id,
            'name' => 'sometimes|string|max:255',
            'brand' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'condition' => 'sometimes|in:good,maintenance,damaged',
            'status' => 'sometimes|in:available,borrowed,disposed',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric',
        ]);

        $asset->update($validated);
        return response()->json(['success' => true, 'data' => $asset]);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return response()->json(['success' => true, 'message' => 'Asset deleted']);
    }
}