<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gold_price_history', function (Blueprint $table) {
            $table->id();
            $table->enum('karat', ['18K', '24K']);
            $table->decimal('price_per_gram', 10, 2);
            $table->string('currency', 10)->default('EUR');
            $table->date('date_recorded');
            $table->unique(['karat', 'date_recorded']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gold_price_history');
    }
};













