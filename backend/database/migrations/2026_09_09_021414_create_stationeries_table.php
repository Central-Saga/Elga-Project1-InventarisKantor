<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('stationeries', function (Blueprint $table) {
        $table->id();
        $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
        $table->string('item_code')->unique(); // Contoh: ATK-2026-001
        $table->string('name');
        $table->integer('stock')->default(0);
        $table->string('unit'); // Pcs, Pack, Rim, Box
        $table->integer('min_stock')->default(5); // Alert batas minimum stok
        $table->timestamps();
        $table->softDeletes();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stationeries');
    }
};
