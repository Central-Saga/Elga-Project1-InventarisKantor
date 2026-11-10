<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Asset;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_an_asset_leaves_an_audit_record(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin-audit@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $category = Category::create(['name' => 'Elektronik', 'type' => 'asset']);
        $asset = Asset::create([
            'category_id' => $category->id,
            'asset_code' => 'AST-2026-001',
            'name' => 'Laptop Audit',
            'condition' => 'good',
            'status' => 'available',
            'stock' => 1,
        ]);

        $this->deleteJson("/api/v1/assets/{$asset->id}")->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'asset.deleted',
            'subject_type' => Asset::class,
            'subject_id' => $asset->id,
            'user_id' => $admin->id,
        ]);
    }

    public function test_updating_user_role_leaves_an_audit_record(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin-audit-role@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $user = User::create([
            'name' => 'Employee',
            'email' => 'employee-audit-role@example.com',
            'password' => 'password',
            'role' => 'employee',
        ]);

        $this->putJson("/api/v1/users/{$user->id}", [
            'name' => 'Employee',
            'email' => 'employee-audit-role@example.com',
            'password' => '',
            'role' => 'admin',
        ])->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'user.updated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'user_id' => $admin->id,
        ]);
    }

    public function test_activity_log_model_has_fillable_and_casts(): void
    {
        $log = ActivityLog::create([
            'user_id' => null,
            'action' => 'asset.deleted',
            'subject_type' => Asset::class,
            'subject_id' => 1,
            'payload_diff' => ['name' => 'Laptop'],
            'created_at' => now(),
        ]);

        $this->assertSame(['name' => 'Laptop'], $log->payload_diff);
        $this->assertSame('asset.deleted', $log->action);
        $this->assertInstanceOf(\Carbon\Carbon::class, $log->created_at);
    }
}
