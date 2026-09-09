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
    Schema::create('stationery_requests', function (Blueprint $table) {
        $table->id();
        $table->foreignId('stationery_id')->constrained('stationeries')->cascadeOnDelete();
        $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        $table->integer('quantity');
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
        $table->text('purpose')->nullable(); // Alasan/keperluan pengambilan ATK
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stationery_requests');
    }
};
