<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AssetLoanTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::create([
            'name'     => 'Test User',
            'email'    => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->category = Category::create([
            'name' => 'Elektronik',
            'type' => 'asset',
        ]);
    }

    public function test_authenticated_user_can_view_asset_loans_list(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/loans');

        $response->assertStatus(200);
    }

    public function test_login_normalizes_email_case(): void
    {
        $this->postJson('/api/v1/login', [
            'email' => 'TEST@EXAMPLE.COM',
            'password' => 'password',
        ])->assertStatus(200);
    }

    public function test_user_can_create_asset_loan_request(): void
    {
        Sanctum::actingAs($this->user);

        $asset = Asset::create([
            'category_id' => $this->category->id,
            'name'        => 'Laptop ThinkPad',
            'asset_code'  => 'AST-001',
            'status'      => 'available',
        ]);

        $payload = [
            'asset_id'             => $asset->id,
            'borrower_name'        => 'Budi Santoso',
            'loan_date'            => now()->format('Y-m-d'),
            'expected_return_date' => now()->addDays(3)->format('Y-m-d'),
            'notes'                => 'Peminjaman laptop untuk rapat'
        ];

        $response = $this->postJson('/api/v1/loans', $payload);

        $response->assertStatus(201);
    }

    public function test_user_can_request_and_admin_can_confirm_asset_return(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $asset = Asset::create([
            'category_id' => $this->category->id,
            'name'        => 'Laptop Dell',
            'asset_code'  => 'AST-002',
            'status'      => 'borrowed',
        ]);

        $loan = AssetLoan::create([
            'asset_id'             => $asset->id,
            'user_id'              => $this->user->id,
            'borrower_name'        => 'Budi Santoso',
            'loan_date'            => now()->format('Y-m-d'),
            'expected_return_date' => now()->addDays(3)->format('Y-m-d'),
            'status'               => 'borrowed',
        ]);

        Sanctum::actingAs($this->user);
        $this->postJson("/api/v1/loans/{$loan->id}/return-request")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'return_requested');

        Sanctum::actingAs($admin);
        $response = $this->postJson("/api/v1/loans/{$loan->id}/return", [
            'return_condition' => 'good',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'returned');
        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'status' => 'available',
        ]);
    }

    public function test_admin_cannot_confirm_return_before_user_request(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin-return@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $asset = Asset::create([
            'category_id' => $this->category->id,
            'name' => 'Laptop Pending Return',
            'asset_code' => 'AST-005',
            'status' => 'borrowed',
        ]);
        $loan = AssetLoan::create([
            'asset_id' => $asset->id,
            'user_id' => $this->user->id,
            'borrower_name' => $this->user->name,
            'loan_date' => now(),
            'status' => 'borrowed',
        ]);

        $this->postJson("/api/v1/loans/{$loan->id}/return", [
            'return_condition' => 'good',
        ])->assertStatus(422);
    }

    public function test_admin_owned_loan_can_be_confirmed_directly(): void
    {
        $admin = User::create([
            'name' => 'Admin Borrower',
            'email' => 'admin-borrower@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $asset = Asset::create([
            'category_id' => $this->category->id,
            'name' => 'Admin Laptop',
            'asset_code' => 'AST-006',
            'status' => 'borrowed',
            'stock' => 0,
        ]);
        $loan = AssetLoan::create([
            'asset_id' => $asset->id,
            'user_id' => $admin->id,
            'borrower_name' => $admin->name,
            'loan_date' => now(),
            'status' => 'approved',
        ]);

        $this->postJson("/api/v1/loans/{$loan->id}/return", [
            'return_condition' => 'good',
        ])->assertStatus(200);
    }

    public function test_user_cannot_request_an_unavailable_asset(): void
    {
        Sanctum::actingAs($this->user);
        $asset = Asset::create([
            'category_id' => $this->category->id,
            'name' => 'Unavailable laptop',
            'asset_code' => 'AST-003',
            'status' => 'borrowed',
        ]);

        $response = $this->postJson('/api/v1/loans', [
            'asset_id' => $asset->id,
            'loan_date' => now()->format('Y-m-d'),
            'expected_return_date' => now()->addDay()->format('Y-m-d'),
        ]);

        $response->assertStatus(422);
    }

    public function test_non_admin_cannot_approve_loan(): void
    {
        Sanctum::actingAs($this->user);
        $asset = Asset::create([
            'category_id' => $this->category->id,
            'name' => 'Approval laptop',
            'asset_code' => 'AST-004',
            'status' => 'available',
        ]);
        $loan = AssetLoan::create([
            'asset_id' => $asset->id,
            'user_id' => $this->user->id,
            'borrower_name' => $this->user->name,
            'loan_date' => now(),
            'status' => 'pending',
        ]);

        $this->patchJson("/api/v1/loans/{$loan->id}/status", ['status' => 'approved'])
            ->assertStatus(403);
    }
}