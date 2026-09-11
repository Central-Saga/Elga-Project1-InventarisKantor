<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE asset_loans DROP CONSTRAINT IF EXISTS asset_loans_status_check');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE asset_loans ADD CONSTRAINT asset_loans_status_check CHECK (status IN ('borrowed', 'returned'))");
    }
};
