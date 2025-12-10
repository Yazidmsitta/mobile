<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->enum('type', ['RING', 'FINGER', 'BRACELET']);
            $table->decimal('diameter_mm', 5, 2)->nullable();
            $table->decimal('circumference_mm', 6, 2)->nullable();
            $table->decimal('size_eu', 4, 1)->nullable();
            $table->decimal('size_us', 4, 1)->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('measurements');
    }
};













