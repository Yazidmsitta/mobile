<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        try {
            \Log::info('Image upload request received', [
                'has_file' => $request->hasFile('image'),
                'all_files' => $request->allFiles(),
                'content_type' => $request->header('Content-Type'),
            ]);

            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            ]);

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                \Log::info('File received', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'extension' => $file->getClientOriginalExtension(),
                ]);
                
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                
                // Ensure the directory exists
                $directory = 'products';
                if (!Storage::disk('public')->exists($directory)) {
                    Storage::disk('public')->makeDirectory($directory);
                }
                
                // Store in public storage
                $path = $file->storeAs($directory, $filename, 'public');
                
                \Log::info('File stored', ['path' => $path]);
                
                // Get the public URL
                $url = Storage::url($path);
                
                // Return full URL using the server's IP address instead of localhost
                // This ensures images are accessible from mobile devices
                $baseUrl = $request->getSchemeAndHttpHost();
                $fullUrl = $baseUrl . $url;

                \Log::info('Image uploaded successfully', [
                    'url' => $fullUrl,
                    'path' => $path,
                ]);

                return response()->json([
                    'url' => $fullUrl,
                    'path' => $path,
                ], 201);
            }

            \Log::warning('No image file in request', [
                'request_keys' => array_keys($request->all()),
            ]);

            return response()->json([
                'message' => 'No image provided',
                'debug' => config('app.debug') ? [
                    'has_file' => $request->hasFile('image'),
                    'files' => $request->allFiles(),
                ] : null,
            ], 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in image upload', [
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error uploading image', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Erreur lors de l\'upload de l\'image',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur est survenue',
            ], 500);
        }
    }
}

