<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'name',
        'description',
        'price',
        'currency',
        'karat',
        'category',
        'main_image_url',
        'is_available',
        'diameter_mm',
        'circumference_mm',
        'size_eu',
        'size_us',
        'weight',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'diameter_mm' => 'decimal:2',
        'circumference_mm' => 'decimal:2',
        'size_eu' => 'decimal:2',
        'size_us' => 'decimal:2',
        'weight' => 'decimal:2',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
}













