<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use RuntimeException;
use Tests\TestCase;

class ApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_validation_errors_use_the_api_error_envelope(): void
    {
        $this->postJson('/api/v1/login', [])
            ->assertUnprocessable()
            ->assertJsonStructure(['success', 'message', 'data', 'errors'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null)
            ->assertJsonPath('errors.email.0', 'The email field is required.');
    }

    public function test_unhandled_api_errors_hide_exception_details(): void
    {
        Route::get('/api/v1/test-api-error', static function () {
            throw new RuntimeException('Sensitive internal exception detail.');
        });

        $response = $this->getJson('/api/v1/test-api-error')
            ->assertInternalServerError()
            ->assertJsonStructure(['success', 'message', 'data', 'errors'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Terjadi kesalahan pada server.')
            ->assertJsonPath('data', null)
            ->assertJsonPath('errors', null);

        $this->assertStringNotContainsString('Sensitive internal exception detail.', $response->getContent());
    }

    public function test_login_endpoint_is_rate_limited_with_a_stable_error_envelope(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/login', [
                'email' => 'unknown@example.test',
                'password' => 'invalid-password',
            ])->assertUnprocessable();
        }

        $this->postJson('/api/v1/login', [
            'email' => 'unknown@example.test',
            'password' => 'invalid-password',
        ])->assertTooManyRequests()
            ->assertJsonStructure(['success', 'message', 'data', 'errors'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null)
            ->assertJsonPath('errors', null);
    }

    public function test_paginated_endpoints_share_the_same_metadata_keys(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        foreach ([
            '/api/v1/assets',
            '/api/v1/atks',
            '/api/v1/categories',
            '/api/v1/loans',
            '/api/v1/atk-transactions',
            '/api/v1/atk-requests',
        ] as $endpoint) {
            $this->getJson($endpoint)
                ->assertOk()
                ->assertJsonStructure([
                    'success',
                    'data',
                    'meta' => ['current_page', 'last_page', 'per_page', 'total'],
                ]);
        }
    }

    public function test_cors_allows_only_configured_frontend_origins(): void
    {
        config(['cors.allowed_origins' => ['https://frontend.example']]);

        $allowed = $this->call('OPTIONS', '/api/v1/login', [], [], [], [
            'HTTP_ORIGIN' => 'https://frontend.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ]);
        $allowed->assertNoContent();
        $this->assertSame('https://frontend.example', $allowed->headers->get('Access-Control-Allow-Origin'));

        $denied = $this->call('OPTIONS', '/api/v1/login', [], [], [], [
            'HTTP_ORIGIN' => 'https://unlisted.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ]);
        $deniedOrigin = $denied->headers->get('Access-Control-Allow-Origin');
        $this->assertNotSame('https://unlisted.example', $deniedOrigin);
        $this->assertNotSame('*', $deniedOrigin);
    }
}
