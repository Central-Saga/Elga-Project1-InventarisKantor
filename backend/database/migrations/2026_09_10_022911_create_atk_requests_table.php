<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('atk_requests', function (Blueprint $table) {
            $table->id();
            $table->string('borrower_name');
            $table->unsignedBigInteger('atk_id');
            $table->integer('quantity');
            $table->string('status')->default('pending'); // <--- TAMBAHKAN BARIS INI
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('atk_requests');
    }
};