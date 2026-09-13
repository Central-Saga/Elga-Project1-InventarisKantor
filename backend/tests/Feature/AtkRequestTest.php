<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Atk;
use App\Models\AtkRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AtkRequestTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::create([
            'name'     => 'Test User',
            'email'    => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
    }

    public function test_authenticated_user_can_fetch_atk_requests(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/atk-requests');

        $response->assertStatus(200);
    }

    public function test_user_can_submit_atk_request(): void
    {
        Sanctum::actingAs($this->user);

        $atk = Atk::create([
            'item_code' => 'ATK-001',
            'name'      => 'Kertas A4',
            'unit'      => 'Rim',
            'stock'     => 50,
        ]);

        $payload = [
            'borrower_name' => 'Budi Santoso',
            'atk_id'        => $atk->id,
            'quantity'      => 5,
            'notes'         => 'Kebutuhan cetak laporan',
        ];

        $response = $this->postJson('/api/v1/atk-requests', $payload);

        $response->assertStatus(201);
    }

    public function test_admin_can_update_atk_request_status(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $atk = Atk::create([
            'item_code' => 'ATK-002',
            'name'      => 'Pulpen Gel',
            'unit'      => 'Pcs',
            'stock'     => 20,
        ]);

        $atkRequest = AtkRequest::create([
            'borrower_name' => 'Siti Aminah',
            'atk_id'        => $atk->id,
            'quantity'      => 2,
            'status'        => 'pending',
        ]);

        $payload = ['status' => 'approved'];

        $response = $this->patchJson("/api/v1/atk-requests/{$atkRequest->id}/status", $payload);

        $response->assertStatus(200);
    }

    public function test_request_cannot_exceed_atk_stock(): void
    {
        Sanctum::actingAs($this->user);
        $atk = Atk::create([
            'item_code' => 'ATK-003',
            'name' => 'Stapler',
            'unit' => 'Pcs',
            'stock' => 2,
        ]);

        $this->postJson('/api/v1/atk-requests', [
            'atk_id' => $atk->id,
            'quantity' => 3,
        ])->assertStatus(422);
    }

    public function test_admin_can_create_atk_with_automatic_code(): void
    {
        $admin = User::create([
            'name' => 'Admin ATK',
            'email' => 'admin-atk@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/atks', [
            'name' => 'Pulpen Otomatis',
            'stock' => 10,
            'unit' => 'Pcs',
            'min_stock' => 2,
        ])->assertCreated()
            ->assertJsonPath('data.item_code', 'ATK-'.now()->year.'-001');
    }
}