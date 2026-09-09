<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:asset,stationery',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($validated);
        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function show(Category $category)
    {
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:asset,stationery',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Category deleted']);
    }
}