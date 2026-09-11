<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('atk_requests', 'status')) {
            Schema::table('atk_requests', function (Blueprint $table) {
                $table->string('status')->default('pending')->after('quantity');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('atk_requests', 'status')) {
            Schema::table('atk_requests', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
