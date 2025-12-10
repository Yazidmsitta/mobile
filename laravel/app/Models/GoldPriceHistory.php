<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoldPriceHistory extends Model
{
    use HasFactory;

    protected $table = 'gold_price_history';

    protected $fillable = [
        'karat',
        'price_per_gram',
        'currency',
        'date_recorded',
    ];

    protected $casts = [
        'price_per_gram' => 'decimal:2',
        'date_recorded' => 'date',
    ];
}













