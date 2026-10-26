<?php

namespace Tests\Unit;

use App\Models\Atk;
use App\Models\AtkRequest;
use App\Models\User;
use App\Repositories\Contracts\AtkRepositoryInterface;
use App\Repositories\Contracts\AtkRequestRepositoryInterface;
use App\Services\AtkRequestService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

class AtkRequestServiceTest extends TestCase
{
    public function test_request_decrements_stock_and_starts_pending(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $atk = new Atk(['stock' => 10]);
        $user = new User(['name' => 'Staff']);
        $user->id = 7;
        $createdRequest = new AtkRequest(['status' => 'pending']);

        $atks = Mockery::mock(AtkRepositoryInterface::class);
        $atks->shouldReceive('findForUpdate')->once()->with(4)->andReturn($atk);
        $atks->shouldReceive('adjustStock')->once()->with($atk, -3)
            ->andReturnUsing(function (Atk $atk, int $amount): void {
                $atk->stock += $amount;
            });

        $requests = Mockery::mock(AtkRequestRepositoryInterface::class);
        $requests->shouldReceive('create')->once()->with([
            'atk_id' => 4,
            'quantity' => 3,
            'user_id' => 7,
            'borrower_name' => 'Staff',
            'status' => 'pending',
        ])->andReturn($createdRequest);

        $result = (new AtkRequestService($atks, $requests))->create([
            'atk_id' => 4,
            'quantity' => 3,
        ], $user);

        $this->assertSame($createdRequest, $result);
        $this->assertSame(7, $atk->stock);
    }

    public function test_request_cannot_decrement_more_than_available_stock(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $atk = new Atk(['stock' => 2]);
        $atks = Mockery::mock(AtkRepositoryInterface::class);
        $atks->shouldReceive('findForUpdate')->once()->with(4)->andReturn($atk);
        $atks->shouldNotReceive('adjustStock');

        $requests = Mockery::mock(AtkRequestRepositoryInterface::class);
        $requests->shouldNotReceive('create');

        try {
            (new AtkRequestService($atks, $requests))->create(
                ['atk_id' => 4, 'quantity' => 3],
                new User(['name' => 'Staff']),
            );
            $this->fail('Expected an insufficient stock validation exception.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('quantity', $exception->errors());
        }
    }

    public function test_rejecting_request_restores_reserved_stock(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $request = new AtkRequest(['atk_id' => 4, 'quantity' => 3, 'status' => 'pending']);
        $atk = new Atk(['stock' => 7]);

        $requests = Mockery::mock(AtkRequestRepositoryInterface::class);
        $requests->shouldReceive('findForUpdate')->once()->with(8)->andReturn($request);
        $requests->shouldReceive('save')->once()->with($request);

        $atks = Mockery::mock(AtkRepositoryInterface::class);
        $atks->shouldReceive('findForUpdate')->once()->with(4)->andReturn($atk);
        $atks->shouldReceive('adjustStock')->once()->with($atk, 3)
            ->andReturnUsing(function (Atk $atk, int $amount): void {
                $atk->stock += $amount;
            });

        $result = (new AtkRequestService($atks, $requests))->updateStatus(8, 'rejected');

        $this->assertSame($request, $result);
        $this->assertSame(10, $atk->stock);
        $this->assertSame('rejected', $request->status);
    }
}
