<?php

namespace App\Services;

use App\Repositories\Contracts\AssetRepositoryInterface;
use App\Repositories\Contracts\AtkRepositoryInterface;

class AssetCodeGenerator
{
    public function __construct(
        private readonly AssetRepositoryInterface $assets,
        private readonly AtkRepositoryInterface $atks,
    ) {}

    public function nextAssetCode(): string
    {
        return $this->nextCode('AST', fn (string $code): bool => $this->assets->codeExists($code));
    }

    public function nextAtkCode(): string
    {
        return $this->nextCode('ATK', fn (string $code): bool => $this->atks->codeExists($code));
    }

    private function nextCode(string $prefix, callable $exists): string
    {
        $year = now()->year;
        $sequence = 1;

        do {
            $code = sprintf('%s-%d-%03d', $prefix, $year, $sequence++);
        } while ($exists($code));

        return $code;
    }
}
