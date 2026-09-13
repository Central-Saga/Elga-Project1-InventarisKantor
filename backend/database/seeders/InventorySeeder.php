<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Asset;
use App\Models\Atk;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Kategori Contoh
        $catElectronics = Category::updateOrCreate(['name' => 'Elektronik & Gadget'], [
            'type' => 'asset',
            'description' => 'Perangkat keras elektronik kantor'
        ]);

        $catFurniture = Category::updateOrCreate(['name' => 'Mebel & Perabot'], [
            'type' => 'asset',
            'description' => 'Fasilitas meja, kursi, dan lemari kantor'
        ]);

        $catPaper = Category::updateOrCreate(['name' => 'Kertas & Pembungkusan'], [
            'type' => 'stationery',
            'description' => 'Kebutuhan cetak mencetak'
        ]);

        // 2. Data Contoh Aset
        Asset::updateOrCreate(['asset_code' => 'AST-2026-001'], [
            'category_id' => $catElectronics->id,
            'asset_code' => 'AST-2026-001',
            'name' => 'MacBook Pro M3 16 Inch',
            'brand' => 'Apple',
            'serial_number' => 'C02XYZ12345',
            'condition' => 'good',
            'status' => 'available',
            'purchase_date' => '2026-01-15',
        ]);

        Asset::updateOrCreate(['asset_code' => 'AST-2026-002'], [
            'category_id' => $catFurniture->id,
            'asset_code' => 'AST-2026-002',
            'name' => 'Kursi Kerja Ergonomis',
            'brand' => 'Ergostore',
            'serial_number' => 'ERG-8812',
            'condition' => 'good',
            'status' => 'available',
            'purchase_date' => '2026-02-01',
        ]);

        // 3. Data Contoh ATK
        Atk::updateOrCreate(['item_code' => 'ATK-2026-001'], [
            'name' => 'Kertas A4 80gr Sidu',
            'stock' => 50,
            'unit' => 'Rim',
            'min_stock' => 10,
        ]);
    }
}