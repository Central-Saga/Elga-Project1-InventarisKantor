<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientAtkStockException extends RuntimeException
{
    public function __construct(int $available)
    {
        parent::__construct('Stok tidak mencukupi! Stok saat ini: '.$available);
    }
}
