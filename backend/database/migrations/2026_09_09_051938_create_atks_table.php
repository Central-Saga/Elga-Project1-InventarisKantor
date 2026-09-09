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
    Schema::create('atks', function (Blueprint $table) {
        $table->id();
        $table->string('item_code')->unique();
        $table->string('name');
        $table->string('unit'); // misal: Box, Rim, Pack, Pcs
        $table->integer('stock')->default(0);
        $table->integer('min_stock')->default(5); // Peringatan jika stok menipis
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atks');
    }
};
