<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('vendor')->where('is_available', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('karat')) {
            $query->where('karat', $request->karat);
        }

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $products = $query->get();

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['vendor', 'images'])->findOrFail($id);

        return response()->json($product);
    }

    // Vendor product management endpoints
    public function vendorIndex(Request $request)
    {
        $user = $request->user();
        
        if ($user->user_type !== 'VENDEUR') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $vendor = $user->vendor;
        if (!$vendor) {
            // Auto-create vendor profile if user is VENDEUR but has no vendor profile
            $vendor = \App\Models\Vendor::create([
                'user_id' => $user->id,
                'shop_name' => $user->name . ' Shop',
                'description' => 'Boutique de produits en or',
                'is_verified' => false,
            ]);
        }

        $products = $vendor->products()->orderBy('created_at', 'desc')->get();

        return response()->json($products);
    }

    public function vendorStore(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->user_type !== 'VENDEUR') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $vendor = $user->vendor;
            if (!$vendor) {
                // Auto-create vendor profile if user is VENDEUR but has no vendor profile
                $vendor = \App\Models\Vendor::create([
                    'user_id' => $user->id,
                    'shop_name' => $user->name . ' Shop',
                    'description' => 'Boutique de produits en or',
                    'is_verified' => false,
                ]);
            }

            \Log::info('Vendor product creation request', [
                'user_id' => $user->id,
                'vendor_id' => $vendor->id,
                'data' => $request->all()
            ]);

            $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'karat' => 'nullable|in:9K,14K,18K,22K,24K',
            'category' => 'required|in:RING,BRACELET,NECKLACE,OTHER',
            'main_image_url' => 'nullable|string|max:255',
            'is_available' => 'nullable|boolean',
            'diameter_mm' => 'nullable|numeric',
            'circumference_mm' => 'nullable|numeric',
            'size_eu' => 'nullable|numeric',
            'size_us' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
        ]);

            $product = $vendor->products()->create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'currency' => $request->currency ?? 'EUR',
                'karat' => $request->karat,
                'category' => $request->category,
                'main_image_url' => $request->main_image_url,
                'is_available' => $request->is_available ?? true,
                'diameter_mm' => $request->diameter_mm ?: null,
                'circumference_mm' => $request->circumference_mm ?: null,
                'size_eu' => $request->size_eu ?: null,
                'size_us' => $request->size_us ?: null,
                'weight' => $request->weight ?: null,
            ]);

            \Log::info('Product created successfully', ['product_id' => $product->id]);

            return response()->json($product, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in vendorStore', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in vendorStore', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Erreur lors de la création du produit',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur est survenue',
            ], 500);
        }
    }

    public function vendorUpdate(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->user_type !== 'VENDEUR') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $vendor = $user->vendor;
        if (!$vendor) {
            // Auto-create vendor profile if user is VENDEUR but has no vendor profile
            $vendor = \App\Models\Vendor::create([
                'user_id' => $user->id,
                'shop_name' => $user->name . ' Shop',
                'description' => 'Boutique de produits en or',
                'is_verified' => false,
            ]);
        }

        $product = $vendor->products()->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'karat' => 'nullable|in:9K,14K,18K,22K,24K',
            'category' => 'sometimes|in:RING,BRACELET,NECKLACE,OTHER',
            'main_image_url' => 'nullable|string|max:255',
            'is_available' => 'nullable|boolean',
            'diameter_mm' => 'nullable|numeric',
            'circumference_mm' => 'nullable|numeric',
            'size_eu' => 'nullable|numeric',
            'size_us' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
        ]);

        $product->update($request->only([
            'name', 'description', 'price', 'currency', 'karat', 
            'category', 'main_image_url', 'is_available',
            'diameter_mm', 'circumference_mm', 'size_eu', 'size_us', 'weight'
        ]));

        return response()->json($product);
    }

    public function vendorDestroy(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->user_type !== 'VENDEUR') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $vendor = $user->vendor;
        if (!$vendor) {
            // Auto-create vendor profile if user is VENDEUR but has no vendor profile
            $vendor = \App\Models\Vendor::create([
                'user_id' => $user->id,
                'shop_name' => $user->name . ' Shop',
                'description' => 'Boutique de produits en or',
                'is_verified' => false,
            ]);
        }

        $product = $vendor->products()->findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}













