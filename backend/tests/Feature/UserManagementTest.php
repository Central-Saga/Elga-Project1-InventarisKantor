<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_a_user(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $create = $this->postJson('/api/v1/users', [
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'password' => 'password',
            'role' => 'staff',
        ])->assertCreated();

        $userId = $create->json('data.id');
        $create->assertJsonPath('data.role', 'employee');

        $this->putJson("/api/v1/users/{$userId}", [
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@example.com',
            'password' => '',
            'role' => 'employee',
        ])->assertOk()->assertJsonPath('data.name', 'Budi Santoso');

        $this->deleteJson("/api/v1/users/{$userId}")
            ->assertOk();
        $this->assertSoftDeleted('users', ['id' => $userId]);
    }

    public function test_employee_cannot_manage_users(): void
    {
        $employee = User::create([
            'name' => 'Employee',
            'email' => 'employee@example.com',
            'password' => bcrypt('password'),
            'role' => 'employee',
        ]);
        Sanctum::actingAs($employee);

        $this->getJson('/api/v1/users')->assertForbidden();
    }

    public function test_deleting_a_user_revokes_their_existing_sanctum_token(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $adminToken = $admin->createToken('admin')->plainTextToken;

        $user = User::create([
            'name' => 'Employee',
            'email' => 'employee@example.com',
            'password' => bcrypt('password'),
            'role' => 'employee',
        ]);

        $login = $this->postJson('/api/v1/login', [
            'email' => 'employee@example.com',
            'password' => 'password',
        ])->assertOk();

        $userToken = $login->json('access_token');

        $this->withToken($adminToken)
            ->deleteJson("/api/v1/users/{$user->id}")
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => hash('sha256', explode('|', $userToken, 2)[1]),
        ]);

        Auth::forgetGuards();

        $this->withToken($userToken)
            ->getJson('/api/v1/user')
            ->assertUnauthorized();
    }
}
