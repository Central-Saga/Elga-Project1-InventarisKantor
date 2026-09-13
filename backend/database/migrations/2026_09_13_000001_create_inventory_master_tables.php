<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['asset', 'stationery']);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('asset_code')->unique();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('serial_number')->nullable()->unique();
            $table->enum('condition', ['good', 'maintenance', 'damaged'])->default('good');
            $table->enum('status', ['available', 'borrowed', 'disposed'])->default('available');
            $table->date('purchase_date')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('status');
        });

        Schema::create('atks', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('name');
            $table->string('unit');
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('atks');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('categories');
    }
};