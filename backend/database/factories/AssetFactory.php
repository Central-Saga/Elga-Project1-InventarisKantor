<?php

namespace Database\Factories;

use App\Models\Asset;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asset>
 */
class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition(): array
    {
        // Dummy data realistis seperti laptop, monitor, proyektor sesuai instruksi issue
        $assets = [
            ['name' => 'Laptop ThinkPad E14', 'brand' => 'Lenovo'],
            ['name' => 'Monitor LED 24 inch', 'brand' => 'Dell'],
            ['name' => 'Proyektor LCD Epson', 'brand' => 'Epson'],
            ['name' => 'PC Desktop Office', 'brand' => 'HP'],
            ['name' => 'Printer Inkjet L3210', 'brand' => 'Canon'],
        ];

        $selected = fake()->randomElement($assets);

        return [
            // Jika kategori belum ada, akan otomatis membuat category baru via factory
            'category_id' => Category::factory(),
            'asset_code' => 'AST-' . fake()->unique()->numerify('#####'),
            'code' => 'C-' . fake()->unique()->numerify('#####'),
            'name' => $selected['name'],
            'brand' => $selected['brand'],
            'serial_number' => 'SN-' . strtoupper(fake()->bothify('###??###')),
            'condition' => fake()->randomElement(['good', 'needs_repair', 'broken']),
            'status' => fake()->randomElement(['available', 'borrowed', 'maintenance']),
            'stock' => fake()->numberBetween(1, 5),
            'purchase_date' => fake()->date(),
            'photo_path' => null,
        ];
    }
}