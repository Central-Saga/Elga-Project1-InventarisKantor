<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('assets', 'purchase_price')) {
            Schema::table('assets', function (Blueprint $table) {
                $table->dropColumn('purchase_price');
            });
        }
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->decimal('purchase_price', 15, 2)->nullable()->after('purchase_date');
        });
    }
};