<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $settings = $request->user()->settings;

        if (!$settings) {
            $settings = Settings::create([
                'user_id' => $request->user()->id,
                'preferred_unit' => 'MM',
                'language' => 'FR',
            ]);
        }

        return response()->json([
            'preferred_unit' => $settings->preferred_unit,
            'language' => $settings->language,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'preferred_unit' => 'sometimes|in:MM,INCH',
            'language' => 'sometimes|in:FR,EN',
        ]);

        $settings = $request->user()->settings;

        if (!$settings) {
            $settings = Settings::create([
                'user_id' => $request->user()->id,
                'preferred_unit' => $request->preferred_unit ?? 'MM',
                'language' => $request->language ?? 'FR',
            ]);
        } else {
            $settings->update([
                'preferred_unit' => $request->preferred_unit ?? $settings->preferred_unit,
                'language' => $request->language ?? $settings->language,
            ]);
        }

        return response()->json([
            'preferred_unit' => $settings->preferred_unit,
            'language' => $settings->language,
        ]);
    }
}













