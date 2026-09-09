<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AtkController;
use App\Http\Controllers\Api\AssetLoanController;
use App\Http\Controllers\Api\AtkTransactionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('assets', AssetController::class);
Route::get('categories', [CategoryController::class, 'index']);
Route::apiResource('atks', AtkController::class);

Route::get('loans', [AssetLoanController::class, 'index']);
Route::post('loans', [AssetLoanController::class, 'store']);
Route::put('loans/{id}/return', [AssetLoanController::class, 'returnAsset']);


Route::get('atk-transactions', [AtkTransactionController::class, 'index']);
Route::post('atk-transactions', [AtkTransactionController::class, 'store']);