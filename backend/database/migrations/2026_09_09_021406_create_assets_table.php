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
    Schema::create('assets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
        $table->string('asset_code')->unique(); // Contoh: AST-2026-001
        $table->string('name');
        $table->string('brand')->nullable();
        $table->string('serial_number')->nullable();
        $table->enum('condition', ['good', 'maintenance', 'damaged'])->default('good');
        $table->enum('status', ['available', 'borrowed', 'disposed'])->default('available');
        $table->date('purchase_date')->nullable();
        $table->decimal('purchase_price', 15, 2)->nullable();
        $table->timestamps();
        $table->softDeletes(); // Standard audit trail
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
