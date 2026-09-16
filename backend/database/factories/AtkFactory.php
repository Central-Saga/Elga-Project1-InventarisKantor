<?php

namespace Database\Factories;

use App\Models\Atk;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Atk>
 */
class AtkFactory extends Factory
{
    protected $model = Atk::class;

    public function definition(): array
    {
        // Dummy data stok ATK realistis
        $atks = [
            ['name' => 'Kertas HVS A4 70gr', 'unit' => 'Rim'],
            ['name' => 'Pulpen Hitam Standard', 'unit' => 'Pcs'],
            ['name' => 'Buku Tulis 58 Lembar', 'unit' => 'Pcs'],
            ['name' => 'Tipp-Ex Correction Pen', 'unit' => 'Pcs'],
            ['name' => 'Sticky Notes 3x3', 'unit' => 'Pad'],
            ['name' => 'Spidol Permanent Hitam', 'unit' => 'Pcs'],
        ];

        $selected = fake()->randomElement($atks);

        return [
            'item_code' => 'ATK-' . fake()->unique()->numerify('#####'),
            'name' => $selected['name'],
            'unit' => $selected['unit'],
            'stock' => fake()->numberBetween(10, 100),
            'min_stock' => fake()->numberBetween(5, 10),
        ];
    }
}