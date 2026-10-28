<?php

namespace Tests\Feature;

use App\Models\Atk;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrudApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_atk_mutations_return_consistent_validation_and_forbidden_responses(): void
    {
        $employee = User::create([
            'name' => 'Employee',
            'email' => 'employee-contract@example.com',
            'password' => 'password',
            'role' => 'employee',
        ]);
        Sanctum::actingAs($employee);

        $this->postJson('/api/v1/atks', [])->assertForbidden()
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['success', 'message']);

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin-contract@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/atks', [])->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['success', 'message', 'errors']);

        $atk = Atk::create([
            'item_code' => 'ATK-CONTRACT-001',
            'name' => 'Pulpen',
            'stock' => 10,
            'unit' => 'Pcs',
        ]);
        $this->putJson("/api/v1/atks/{$atk->id}", [])->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_asset_mutations_use_policy_and_resource_response(): void
    {
        $employee = User::create([
            'name' => 'Employee',
            'email' => 'employee-assets@example.com',
            'password' => 'password',
            'role' => 'employee',
        ]);
        $category = Category::create(['name' => 'Elektronik', 'type' => 'asset']);
        Sanctum::actingAs($employee);

        $this->postJson('/api/v1/assets', [
            'name' => 'Laptop',
            'category_id' => $category->id,
            'condition' => 'good',
        ])->assertForbidden()
            ->assertJsonPath('success', false);

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin-assets@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $created = $this->postJson('/api/v1/assets', [
            'name' => 'Laptop',
            'category_id' => $category->id,
            'condition' => 'good',
        ])->assertCreated()->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'message', 'data']);

        $this->postJson('/api/v1/assets', [
            'name' => 'Laptop Invalid',
            'category_id' => 999999,
            'condition' => 'unknown',
        ])->assertUnprocessable()
            ->assertJsonPath('success', false);

        $id = $created->json('data.id');
        $this->putJson("/api/v1/assets/{$id}", [] )->assertUnprocessable();
    }

    public function test_user_mutations_use_policy_separate_requests_and_resources(): void
    {
        $employee = User::create([
            'name' => 'Employee',
            'email' => 'employee-users@example.com',
            'password' => 'password',
            'role' => 'employee',
        ]);
        Sanctum::actingAs($employee);

        $this->postJson('/api/v1/users', [])->assertForbidden()
            ->assertJsonPath('success', false);

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin-users@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/users', [])->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['success', 'message', 'errors']);

        $created = $this->postJson('/api/v1/users', [
            'name' => 'Staff Baru',
            'email' => 'staff-contract@example.com',
            'password' => 'password',
            'role' => 'staff',
        ])->assertCreated()->assertJsonPath('success', true)
            ->assertJsonPath('data.role', 'employee');

        $id = $created->json('data.id');
        $this->putJson("/api/v1/users/{$id}", [])->assertUnprocessable();
    }
}
