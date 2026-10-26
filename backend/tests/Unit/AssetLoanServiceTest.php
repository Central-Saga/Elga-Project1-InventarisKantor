<?php

namespace Tests\Unit;

use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\User;
use App\Repositories\Contracts\AssetLoanRepositoryInterface;
use App\Repositories\Contracts\AssetRepositoryInterface;
use App\Services\AssetLoanService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

class AssetLoanServiceTest extends TestCase
{
    public function test_creating_loan_reserves_stock_and_records_pending_request(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $asset = new Asset(['status' => 'available', 'stock' => 1]);
        $user = new User(['name' => 'Staff']);
        $user->id = 5;
        $createdLoan = new AssetLoan(['status' => 'pending']);

        $assets = Mockery::mock(AssetRepositoryInterface::class);
        $assets->shouldReceive('findForUpdate')->once()->with(3)->andReturn($asset);
        $assets->shouldReceive('adjustStock')->once()->with($asset, -1)
            ->andReturnUsing(function (Asset $asset, int $amount): void {
                $asset->stock += $amount;
            });
        $assets->shouldReceive('save')->once()->with($asset);

        $loans = Mockery::mock(AssetLoanRepositoryInterface::class);
        $loans->shouldReceive('create')->once()->with([
            'asset_id' => 3,
            'loan_date' => '2026-10-26',
            'user_id' => 5,
            'borrower_name' => 'Staff',
            'status' => 'pending',
        ])->andReturn($createdLoan);

        $result = (new AssetLoanService($assets, $loans))->create([
            'asset_id' => 3,
            'loan_date' => '2026-10-26',
        ], $user);

        $this->assertSame($createdLoan, $result);
        $this->assertSame(0, $asset->stock);
        $this->assertSame('borrowed', $asset->status);
    }

    public function test_rejecting_pending_loan_restores_asset_stock(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $loan = new AssetLoan(['asset_id' => 3, 'status' => 'pending']);
        $asset = new Asset(['stock' => 0, 'status' => 'borrowed']);
        $loan->setRelation('asset', $asset);

        $assets = Mockery::mock(AssetRepositoryInterface::class);
        $assets->shouldReceive('findForUpdate')->once()->with(3)->andReturn($asset);
        $assets->shouldReceive('adjustStock')->once()->with($asset, 1)
            ->andReturnUsing(function (Asset $asset, int $amount): void {
                $asset->stock += $amount;
            });
        $assets->shouldReceive('save')->once()->with($asset);

        $loans = Mockery::mock(AssetLoanRepositoryInterface::class);
        $loans->shouldReceive('findForUpdate')->once()->with(9)->andReturn($loan);
        $loans->shouldReceive('save')->once()->with($loan);
        $loans->shouldReceive('freshWithRelations')->once()->with($loan)->andReturn($loan);

        $result = (new AssetLoanService($assets, $loans))->updateStatus(9, 'rejected');

        $this->assertSame($loan, $result);
        $this->assertSame('rejected', $loan->status);
        $this->assertSame('available', $asset->status);
        $this->assertSame(1, $asset->stock);
    }

    public function test_admin_cannot_return_the_same_loan_twice(): void
    {
        DB::shouldReceive('transaction')
            ->once()
            ->andReturnUsing(fn (callable $callback) => $callback());

        $loan = new AssetLoan(['asset_id' => 3, 'status' => 'returned']);
        $loans = Mockery::mock(AssetLoanRepositoryInterface::class);
        $loans->shouldReceive('findForUpdate')->once()->with(9)->andReturn($loan);

        $assets = Mockery::mock(AssetRepositoryInterface::class);
        $assets->shouldNotReceive('findForUpdate');
        $assets->shouldNotReceive('adjustStock');

        try {
            (new AssetLoanService($assets, $loans))->returnAsset(9, 'good', true);
            $this->fail('Expected an invalid loan status exception.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('status', $exception->errors());
        }
    }
}
