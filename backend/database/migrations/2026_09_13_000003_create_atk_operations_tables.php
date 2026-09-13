<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('atk_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('atk_id')->constrained('atks')->cascadeOnDelete();
            $table->enum('type', ['in', 'out']);
            $table->integer('qty');
            $table->string('recipient_or_supplier')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('atk_requests', function (Blueprint $table) {
            $table->id();
            $table->string('borrower_name');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('atk_id')->constrained('atks')->cascadeOnDelete();
            $table->integer('quantity');
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('atk_requests');
        Schema::dropIfExists('atk_transactions');
    }
};