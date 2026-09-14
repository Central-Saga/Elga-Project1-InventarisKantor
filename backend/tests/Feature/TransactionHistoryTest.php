<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\Atk;
use App\Models\AtkRequest;
use App\Models\AtkTransaction;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransactionHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_combined_transaction_history(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $employee = User::create([
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'password' => bcrypt('password'),
            'role' => 'employee',
        ]);
        $atk = Atk::create([
            'item_code' => 'ATK-TEST-001',
            'name' => 'Pulpen',
            'stock' => 20,
            'unit' => 'Pcs',
        ]);
        $category = Category::create(['name' => 'Elektronik', 'type' => 'asset']);
        $asset = Asset::create([
            'category_id' => $category->id,
            'asset_code' => 'AST-TEST-001',
            'name' => 'Laptop Kantor',
            'status' => 'borrowed',
        ]);
        AtkRequest::create([
            'borrower_name' => $employee->name,
            'user_id' => $employee->id,
            'atk_id' => $atk->id,
            'quantity' => 3,
            'status' => 'approved',
            'notes' => 'Keperluan rapat',
        ]);
        AtkTransaction::create([
            'atk_id' => $atk->id,
            'type' => 'out',
            'qty' => 2,
            'recipient_or_supplier' => $employee->name,
            'notes' => 'Stok operasional',
        ]);
        AssetLoan::create([
            'asset_id' => $asset->id,
            'user_id' => $employee->id,
            'borrower_name' => $employee->name,
            'loan_date' => '2026-09-14',
            'expected_return_date' => '2026-09-20',
            'status' => 'borrowed',
            'notes' => 'Pekerjaan lapangan',
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/transaction-history')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonFragment(['category' => 'Aset'])
            ->assertJsonFragment(['category' => 'ATK']);
    }

    public function test_employee_cannot_view_transaction_history(): void
    {
        $employee = User::create([
            'name' => 'Employee',
            'email' => 'employee@example.com',
            'password' => bcrypt('password'),
            'role' => 'employee',
        ]);
        Sanctum::actingAs($employee);

        $this->getJson('/api/v1/transaction-history')->assertForbidden();
    }
}