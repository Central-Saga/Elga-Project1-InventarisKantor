<?php

namespace Tests\Unit;

use App\Exceptions\InsufficientAtkStockException;
use App\Models\Atk;
use App\Models\AtkTransaction;
use App\Repositories\Contracts\AtkRepositoryInterface;
use App\Repositories\Contracts\AtkTransactionRepositoryInterface;
use App\Services\AtkStockService;
use Illuminate\Support\Facades\DB;
use Mockery;
use Tests\TestCase;

class AtkStockServiceTest extends TestCase
{
    public function test_stock_out_is_recorded_and_decrements_inventory(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $atk = new Atk(['stock' => 8]);
        $transaction = new AtkTransaction;
        $atks = Mockery::mock(AtkRepositoryInterface::class);
        $atks->shouldReceive('findForUpdate')->once()->with(2)->andReturn($atk);
        $atks->shouldReceive('adjustStock')->once()->with($atk, -3)
            ->andReturnUsing(function (Atk $atk, int $amount): void {
                $atk->stock += $amount;
            });

        $transactions = Mockery::mock(AtkTransactionRepositoryInterface::class);
        $transactions->shouldReceive('create')->once()->with([
            'atk_id' => 2,
            'qty' => 3,
            'type' => 'out',
        ])->andReturn($transaction);

        $result = (new AtkStockService($atks, $transactions))->recordTransaction([
            'atk_id' => 2,
            'qty' => 3,
            'type' => 'out',
        ]);

        $this->assertSame($transaction, $result);
        $this->assertSame(5, $atk->stock);
    }

    public function test_stock_out_cannot_exceed_available_inventory(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $atk = new Atk(['stock' => 2]);
        $atks = Mockery::mock(AtkRepositoryInterface::class);
        $atks->shouldReceive('findForUpdate')->once()->with(2)->andReturn($atk);
        $atks->shouldNotReceive('adjustStock');

        $transactions = Mockery::mock(AtkTransactionRepositoryInterface::class);
        $transactions->shouldNotReceive('create');

        try {
            (new AtkStockService($atks, $transactions))->recordTransaction([
                'atk_id' => 2,
                'qty' => 3,
                'type' => 'out',
            ]);
            $this->fail('Expected an insufficient stock exception.');
        } catch (InsufficientAtkStockException $exception) {
            $this->assertSame('Stok tidak mencukupi! Stok saat ini: 2', $exception->getMessage());
        }
    }
}
