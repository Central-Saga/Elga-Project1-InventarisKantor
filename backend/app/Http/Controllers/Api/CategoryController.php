<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $perPage = min(max((int) request('per_page', 50), 1), 100);
        $categories = Category::latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $categories->items(),
            'meta'    => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ],
        ], 200);
    }
}