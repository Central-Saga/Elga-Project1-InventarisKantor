<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AtkController;
use App\Http\Controllers\Api\AssetLoanController;
use App\Http\Controllers\Api\AtkTransactionController;
use App\Http\Controllers\Api\AtkRequestController;

// Route Public (Tanpa Login)
Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Route Aplikasi (Wajib Login dengan Sanctum Bearer Token)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Mengambil data user yang sedang login secara dinamis
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data'    => $request->user()
        ]);
    });

    Route::apiResource('assets', AssetController::class);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::apiResource('atks', AtkController::class);
    Route::post('/atks/{id}/add-stock', [AtkController::class, 'addStock']);

    Route::get('/loans', [AssetLoanController::class, 'index']);
    Route::post('/loans', [AssetLoanController::class, 'store']);
    Route::patch('/loans/{id}/status', [AssetLoanController::class, 'updateStatus']);
    Route::post('/loans/{id}/return', [AssetLoanController::class, 'returnAsset']);

    Route::get('atk-transactions', [AtkTransactionController::class, 'index']);
    Route::post('atk-transactions', [AtkTransactionController::class, 'store']);

    Route::get('/atk-requests', [AtkRequestController::class, 'index']);
    Route::post('/atk-requests', [AtkRequestController::class, 'store']);
    Route::patch('/atk-requests/{id}/status', [AtkRequestController::class, 'updateStatus']);
});