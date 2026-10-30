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
        if (app()->environment('production')) {
            $demoPassword = env('DEMO_PASSWORD');
            if (empty($demoPassword)) {
                $this->command?->warn('Melewati seeder akun demo pada production karena DEMO_PASSWORD tidak diatur.');
                return;
            }
        } else {
            $demoPassword = env('DEMO_PASSWORD', 'password');
        }

        User::updateOrCreate(
            ['email' => 'budi@example.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make($demoPassword),
                'role' => 'employee',
            ],
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Inventaris',
                'password' => Hash::make($demoPassword),
                'role' => 'admin',
            ],
        );

        $this->call([
            InventorySeeder::class,
        ]);
    }
}
