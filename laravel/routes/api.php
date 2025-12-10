<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MeasurementController;
use App\Http\Controllers\Api\GoldPriceController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Image upload
    Route::post('/images/upload', [\App\Http\Controllers\Api\ImageController::class, 'upload']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    Route::apiResource('measurements', MeasurementController::class);
    
    Route::get('/gold-prices', [GoldPriceController::class, 'index']);
    
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    
    // Vendor product management
    Route::prefix('vendor')->group(function () {
        Route::get('/products', [ProductController::class, 'vendorIndex']);
        Route::post('/products', [ProductController::class, 'vendorStore']);
        Route::put('/products/{id}', [ProductController::class, 'vendorUpdate']);
        Route::delete('/products/{id}', [ProductController::class, 'vendorDestroy']);
    });
    
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);
});













