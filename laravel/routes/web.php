<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Ring Sizer API']);
});

// Page de test pour l'API
Route::get('/test-api', function () {
    return view('test-api');
});

