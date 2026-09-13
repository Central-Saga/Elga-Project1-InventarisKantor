<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'budi@example.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'employee',
            ],
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Inventaris',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
        );

        $this->call([
            InventorySeeder::class,
        ]);
    }
}
