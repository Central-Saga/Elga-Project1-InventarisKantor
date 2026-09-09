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
        $table->foreignId('asset_id')->constrained()->onDelete('cascade');
        $table->string('borrower_name');
        $table->string('borrower_email')->nullable(); // Ubah jadi nullable agar tidak wajib
        $table->date('loan_date');
        $table->date('expected_return_date')->nullable(); // Tambahkan ini
        $table->date('return_date')->nullable();
        $table->enum('status', ['borrowed', 'returned'])->default('borrowed');
        $table->text('notes')->nullable(); // Tambahkan notes jika belum ada
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
