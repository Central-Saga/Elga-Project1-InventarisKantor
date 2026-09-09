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
    Schema::create('asset_loans', function (Blueprint $table) {
        $table->id();
        $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
        $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        $table->date('loan_date');
        $table->date('expected_return_date');
        $table->date('actual_return_date')->nullable();
        $table->enum('status', ['pending', 'approved', 'rejected', 'returned', 'overdue'])->default('pending');
        $table->text('notes')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_loans');
    }
};
