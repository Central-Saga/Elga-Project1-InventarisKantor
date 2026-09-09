<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Asset;
use App\Models\Stationery;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Kategori Contoh
        $catElectronics = Category::create([
            'name' => 'Elektronik & Gadget',
            'type' => 'asset',
            'description' => 'Perangkat keras elektronik kantor'
        ]);

        $catFurniture = Category::create([
            'name' => 'Mebel & Perabot',
            'type' => 'asset',
            'description' => 'Fasilitas meja, kursi, dan lemari kantor'
        ]);

        $catPaper = Category::create([
            'name' => 'Kertas & Pembungkusan',
            'type' => 'stationery',
            'description' => 'Kebutuhan cetak mencetak'
        ]);

        // 2. Data Contoh Aset
        Asset::create([
            'category_id' => $catElectronics->id,
            'asset_code' => 'AST-2026-001',
            'name' => 'MacBook Pro M3 16 Inch',
            'brand' => 'Apple',
            'serial_number' => 'C02XYZ12345',
            'condition' => 'good',
            'status' => 'available',
            'purchase_date' => '2026-01-15',
            'purchase_price' => 35000000.00,
        ]);

        Asset::create([
            'category_id' => $catFurniture->id,
            'asset_code' => 'AST-2026-002',
            'name' => 'Kursi Kerja Ergonomis',
            'brand' => 'Ergostore',
            'serial_number' => 'ERG-8812',
            'condition' => 'good',
            'status' => 'available',
            'purchase_date' => '2026-02-01',
            'purchase_price' => 2500000.00,
        ]);

        // 3. Data Contoh ATK
        Stationery::create([
            'category_id' => $catPaper->id,
            'item_code' => 'ATK-2026-001',
            'name' => 'Kertas A4 80gr Sidu',
            'stock' => 50,
            'unit' => 'Rim',
            'min_stock' => 10,
        ]);
    }
}