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
    Schema::create('atk_requests', function (Blueprint $table) {
        $table->id();
        $table->string('borrower_name'); // atau requester_name
        $table->unsignedBigInteger('atk_id'); // menyesuaikan relasi barang ATK
        $table->integer('quantity');
        $table->text('notes')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atk_requests');
    }
};
