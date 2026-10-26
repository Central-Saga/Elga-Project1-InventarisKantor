<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetResource;
use App\Services\AssetService;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function __construct(private readonly AssetService $assets) {}

    public function index()
    {
        $assets = $this->assets->paginate(min(max((int) request('per_page', 15), 1), 100));

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
        $asset = $this->assets->create($request->safe()->except('photo'), $request->file('photo'));

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil ditambahkan!',
            'data' => new AssetResource($asset),
        ], 201);
    }

    public function show(int $id)
    {
        return response()->json([
            'success' => true,
            'data' => new AssetResource($this->assets->find($id)),
        ]);
    }

    public function update(UpdateAssetRequest $request, int $id)
    {
        $asset = $this->assets->update($id, $request->safe()->except('photo'), $request->file('photo'));

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil diperbarui!',
            'data' => new AssetResource($asset),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat menghapus aset.');
        $this->assets->delete($id);

        return response()->json(['success' => true, 'message' => 'Aset berhasil dihapus!']);
    }
}
