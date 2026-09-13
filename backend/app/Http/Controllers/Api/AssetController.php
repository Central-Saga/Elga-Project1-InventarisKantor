<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function index()
    {
        $perPage = min(max((int) request('per_page', 15), 1), 100);
        $assets = Asset::with('category')->latest()->paginate($perPage);
        return response()->json([
            'success' => true,
            'data' => AssetResource::collection($assets->items()),
            'meta' => [
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
            ],
        ]);
    }

    public function store(StoreAssetRequest $request)
    {
        $validated = $request->validated();
        $validated['asset_code'] = $this->nextAssetCode();
        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('assets', 'public');
        }
        unset($validated['photo']);

        $asset = Asset::create($validated);
        $asset->load('category'); // Load relasi kategori untuk dikirim balik ke Next.js

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil ditambahkan!',
            'data'    => new AssetResource($asset),
        ], 201);
    }

    private function nextAssetCode(): string
    {
        $year = now()->year;
        $sequence = 1;

        do {
            $code = sprintf('AST-%d-%03d', $year, $sequence++);
        } while (Asset::withTrashed()->where('asset_code', $code)->exists());

        return $code;
    }

    public function show(Asset $asset)
    {
        return response()->json(['success' => true, 'data' => new AssetResource($asset->load('category'))]);
    }

    public function update(UpdateAssetRequest $request, Asset $asset)
    {
        $validated = $request->validated();
        if ($request->hasFile('photo')) {
            if ($asset->photo_path) {
                Storage::disk('public')->delete($asset->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('assets', 'public');
        }
        unset($validated['photo']);

        $asset->update($validated);
        $asset->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil diperbarui!',
            'data'    => new AssetResource($asset),
        ]);
    }

    public function destroy(Asset $asset)
    {
        abort_unless(request()->user()?->role === 'admin', 403, 'Hanya admin yang dapat menghapus aset.');
        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil dihapus!'
        ]);
    }
}