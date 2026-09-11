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

    public function test_user_can_return_borrowed_asset(): void
    {
        Sanctum::actingAs($this->user);

        $asset = Asset::create([
            'category_id' => $this->category->id,
            'name'        => 'Laptop Dell',
            'asset_code'  => 'AST-002',
            'status'      => 'borrowed',
        ]);

        $loan = AssetLoan::create([
            'asset_id'             => $asset->id,
            'borrower_name'        => 'Budi Santoso',
            'loan_date'            => now()->format('Y-m-d'),
            'expected_return_date' => now()->addDays(3)->format('Y-m-d'),
            'status'               => 'borrowed',
        ]);

        $response = $this->postJson("/api/v1/loans/{$loan->id}/return");

        $response->assertStatus(200);
    }
}