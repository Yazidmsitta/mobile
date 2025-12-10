<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GoldPriceHistory;
use Carbon\Carbon;

class GoldPriceHistorySeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding gold price history...');

        $basePrice24K = 60.0; // Base price per gram for 24K gold in EUR
        $today = Carbon::today();
        $days = 90; // Last 90 days

        for ($i = 0; $i < $days; $i++) {
            $date = $today->copy()->subDays($i);
            
            // Simulate price variations (±5%)
            $variation = (rand(-50, 50) / 1000); // ±5%
            $price24K = $basePrice24K * (1 + $variation);
            $price18K = $basePrice24K * 0.75 * (1 + $variation);

            // Check if record exists
            $existing24K = GoldPriceHistory::where('karat', '24K')
                ->where('date_recorded', $date->format('Y-m-d'))
                ->first();
            
            $existing18K = GoldPriceHistory::where('karat', '18K')
                ->where('date_recorded', $date->format('Y-m-d'))
                ->first();

            // Create 24K if not exists
            if (!$existing24K) {
                GoldPriceHistory::create([
                    'karat' => '24K',
                    'price_per_gram' => round($price24K, 2),
                    'currency' => 'EUR',
                    'date_recorded' => $date->format('Y-m-d'),
                ]);
            }

            // Create 18K if not exists
            if (!$existing18K) {
                GoldPriceHistory::create([
                    'karat' => '18K',
                    'price_per_gram' => round($price18K, 2),
                    'currency' => 'EUR',
                    'date_recorded' => $date->format('Y-m-d'),
                ]);
            }
        }

        $this->command->info('Gold price history seeded successfully!');
    }
}
