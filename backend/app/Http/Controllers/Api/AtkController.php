<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAtkRequest;
use App\Http\Requests\UpdateAtkRequest;
use App\Http\Resources\AtkResource;
use App\Models\Atk;
use App\Services\AtkService;
use App\Services\AtkStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AtkController extends Controller
{
    public function __construct(
        private readonly AtkService $atks,
        private readonly AtkStockService $stock,
    ) {}

    public function index()
    {
        $atks = $this->atks->paginate(min(max((int) request('per_page', 15), 1), 100));

        return response()->json([
            'success' => true,
            'data' => AtkResource::collection($atks->items()),
            'meta' => [
                'current_page' => $atks->currentPage(),
                'last_page' => $atks->lastPage(),
                'per_page' => $atks->perPage(),
                'total' => $atks->total(),
            ],
        ]);
    }

    public function store(StoreAtkRequest $request)
    {
        Gate::authorize('create', Atk::class);

        return response()->json([
            'success' => true,
            'message' => 'ATK baru berhasil ditambahkan.',
            'data' => new AtkResource($this->atks->create($request->validated())),
        ], 201);
    }

    public function addStock(Request $request, int $id)
    {
        Gate::authorize('update', $this->atks->find($id));
        $validated = $request->validate(['additional_stock' => 'required|integer|min:1']);
        $atk = $this->stock->addStock($id, $validated['additional_stock']);

        return response()->json([
            'success' => true,
            'message' => 'Stok ATK berhasil ditambahkan.',
            'data' => new AtkResource($atk),
        ]);
    }

    public function update(UpdateAtkRequest $request, int $id)
    {
        Gate::authorize('update', $this->atks->find($id));
        $atk = $this->atks->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data stok ATK berhasil diperbarui.',
            'data' => new AtkResource($atk),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        Gate::authorize('delete', Atk::findOrFail($id));
        $this->atks->delete($id);

        return response()->json(['success' => true, 'message' => 'Stok ATK berhasil dihapus.']);
    }
}
