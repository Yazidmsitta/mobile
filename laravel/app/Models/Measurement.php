<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Measurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'diameter_mm',
        'circumference_mm',
        'size_eu',
        'size_us',
        'last_synced_at',
    ];

    protected $casts = [
        'diameter_mm' => 'decimal:2',
        'circumference_mm' => 'decimal:2',
        'size_eu' => 'decimal:1',
        'size_us' => 'decimal:1',
        'last_synced_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}













