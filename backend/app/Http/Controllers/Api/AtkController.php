<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAtkRequest;
use App\Http\Resources\AtkResource;
use App\Models\Atk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AtkController extends Controller
{
    // Menampilkan daftar seluruh ATK
    public function index()
    {
        $perPage = min(max((int) request('per_page', 15), 1), 100);
        $atks = Atk::latest()->paginate($perPage);
        return response()->json([
            'success' => true,
            'data'    => AtkResource::collection($atks->items()),
            'meta'    => [
                'current_page' => $atks->currentPage(),
                'last_page' => $atks->lastPage(),
                'per_page' => $atks->perPage(),
                'total' => $atks->total(),
            ],
        ]);
    }

    // Input / Menambah ATK baru ke sistem
    public function store(StoreAtkRequest $request)
    {
        $validated = $request->validated();
        $validated['item_code'] = $this->nextItemCode();
        $atk = Atk::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'ATK baru berhasil ditambahkan.',
            'data'    => new AtkResource($atk),
        ], 201);
    }

    private function nextItemCode(): string
    {
        $year = now()->year;
        $sequence = 1;

        do {
            $code = sprintf('ATK-%d-%03d', $year, $sequence++);
        } while (Atk::withTrashed()->where('item_code', $code)->exists());

        return $code;
    }

    // Menambah stok ATK yang sudah ada
    public function addStock(Request $request, $id)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat menambah stok ATK.');

        $validated = $request->validate([
            'additional_stock' => 'required|integer|min:1',
        ]);

        $atk = DB::transaction(function () use ($validated, $id) {
            $atk = Atk::lockForUpdate()->findOrFail($id);
            $atk->increment('stock', $validated['additional_stock']);
            return $atk->fresh();
        });

        return response()->json([
            'success' => true,
            'message' => 'Stok ATK berhasil ditambahkan.',
            'data'    => new AtkResource($atk),
        ]);
    }

    public function update(Request $request, Atk $atk)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat mengubah stok ATK.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'stock' => ['required', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
        ]);

        $atk->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data stok ATK berhasil diperbarui.',
            'data' => new AtkResource($atk->fresh()),
        ]);
    }

    public function destroy(Request $request, Atk $atk)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat menghapus stok ATK.');

        $atk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Stok ATK berhasil dihapus.',
        ]);
    }
}