<?php

namespace Tests\Unit;

use App\Repositories\Contracts\AssetRepositoryInterface;
use App\Repositories\Contracts\AtkRepositoryInterface;
use App\Services\AssetCodeGenerator;
use Mockery;
use Tests\TestCase;

class AssetCodeGeneratorTest extends TestCase
{
    public function test_asset_code_generator_skips_codes_that_already_exist(): void
    {
        $assets = Mockery::mock(AssetRepositoryInterface::class);
        $assets->shouldReceive('codeExists')
            ->once()
            ->with('AST-'.now()->year.'-001')
            ->andReturnTrue();
        $assets->shouldReceive('codeExists')
            ->once()
            ->with('AST-'.now()->year.'-002')
            ->andReturnFalse();

        $atks = Mockery::mock(AtkRepositoryInterface::class);

        $this->assertSame(
            'AST-'.now()->year.'-002',
            (new AssetCodeGenerator($assets, $atks))->nextAssetCode(),
        );
    }

    public function test_atk_code_generator_starts_at_the_first_available_code(): void
    {
        $assets = Mockery::mock(AssetRepositoryInterface::class);
        $atks = Mockery::mock(AtkRepositoryInterface::class);
        $atks->shouldReceive('codeExists')
            ->once()
            ->with('ATK-'.now()->year.'-001')
            ->andReturnFalse();

        $this->assertSame(
            'ATK-'.now()->year.'-001',
            (new AssetCodeGenerator($assets, $atks))->nextAtkCode(),
        );
    }
}
