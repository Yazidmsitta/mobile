<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('diameter_mm', 8, 2)->nullable()->after('is_available');
            $table->decimal('circumference_mm', 8, 2)->nullable()->after('diameter_mm');
            $table->decimal('size_eu', 6, 2)->nullable()->after('circumference_mm');
            $table->decimal('size_us', 6, 2)->nullable()->after('size_eu');
            $table->decimal('weight', 8, 2)->nullable()->after('size_us');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['diameter_mm', 'circumference_mm', 'size_eu', 'size_us', 'weight']);
        });
    }
};

