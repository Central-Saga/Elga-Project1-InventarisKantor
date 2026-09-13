<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('borrower_name');
            $table->string('borrower_email')->nullable();
            $table->date('loan_date');
            $table->date('expected_return_date')->nullable();
            $table->date('return_date')->nullable();
            $table->string('return_condition')->nullable();
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('status');
            $table->index('asset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_loans');
    }
};