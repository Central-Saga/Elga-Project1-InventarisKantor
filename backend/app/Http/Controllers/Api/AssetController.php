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
            'asset_code'     => 'required|unique:assets,asset_code',
            'name'           => 'required|string|max:255',
            'brand'          => 'nullable|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'condition'      => 'required|string',
            'status'         => 'required|string',
            'purchase_date'  => 'nullable|date',
            'purchase_price' => 'nullable|numeric',
        ]);

        $asset = Asset::create($validated);
        $asset->load('category'); // Load relasi kategori untuk dikirim balik ke Next.js

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil ditambahkan!',
            'data'    => $asset
        ], 201);
    }

    public function show(Asset $asset)
    {
        return response()->json(['success' => true, 'data' => $asset->load('category')]);
    }

    public function update(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);

        $validated = $request->validate([
            'asset_code'     => 'required|unique:assets,asset_code,' . $id,
            'name'           => 'required|string|max:255',
            'brand'          => 'nullable|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'condition'      => 'required|string',
            'status'         => 'required|string',
        ]);

        $asset->update($validated);
        $asset->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil diperbarui!',
            'data'    => $asset
        ]);
    }

    public function destroy($id)
    {
        $asset = Asset::findOrFail($id);
        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil dihapus!'
        ]);
    }
}