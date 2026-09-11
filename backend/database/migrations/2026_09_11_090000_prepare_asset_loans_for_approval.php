<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_loans', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('asset_id')->constrained('users')->nullOnDelete();
        });

        DB::statement("ALTER TABLE asset_loans ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE asset_loans ALTER COLUMN status TYPE varchar(20) USING status::text");
        DB::statement("ALTER TABLE asset_loans ALTER COLUMN status SET DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("UPDATE asset_loans SET status = 'borrowed' WHERE status IN ('pending', 'approved', 'rejected')");
        DB::statement("ALTER TABLE asset_loans ALTER COLUMN status TYPE varchar(20) USING status::text");

        Schema::table('asset_loans', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
