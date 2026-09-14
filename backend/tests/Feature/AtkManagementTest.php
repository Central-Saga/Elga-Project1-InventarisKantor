<?php

namespace Tests\Feature;

use App\Models\Atk;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AtkManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_and_delete_atk_stock(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $atk = Atk::create([
            'item_code' => 'ATK-TEST-001',
            'name' => 'Kertas A4',
            'stock' => 10,
            'unit' => 'Rim',
            'min_stock' => 5,
        ]);
        Sanctum::actingAs($admin);

        $this->putJson("/api/v1/atks/{$atk->id}", [
            'name' => 'Kertas A4 Premium',
            'stock' => 25,
            'unit' => 'Rim',
            'min_stock' => 8,
        ])->assertOk()->assertJsonPath('data.stock', 25);

        $this->deleteJson("/api/v1/atks/{$atk->id}")
            ->assertOk();
        $this->assertSoftDeleted('atks', ['id' => $atk->id]);
    }

    public function test_employee_cannot_update_or_delete_atk_stock(): void
    {
        $employee = User::create([
            'name' => 'Employee',
            'email' => 'employee@example.com',
            'password' => bcrypt('password'),
            'role' => 'employee',
        ]);
        $atk = Atk::create([
            'item_code' => 'ATK-TEST-002',
            'name' => 'Pulpen',
            'stock' => 10,
            'unit' => 'Pcs',
        ]);
        Sanctum::actingAs($employee);

        $this->putJson("/api/v1/atks/{$atk->id}", [
            'name' => 'Pulpen Biru',
            'stock' => 10,
            'unit' => 'Pcs',
        ])->assertForbidden();

        $this->deleteJson("/api/v1/atks/{$atk->id}")
            ->assertForbidden();
    }
}