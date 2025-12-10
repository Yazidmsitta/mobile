<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\GoldPriceHistory;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class FetchGoldPrices extends Command
{
    protected $signature = 'gold:fetch {--days=30 : Number of days of historical data to fetch}';
    protected $description = 'Fetch gold prices from external API and store in database';

    public function handle()
    {
        $days = (int) $this->option('days');
        $this->info("Fetching gold prices for the last {$days} days...");

        // Using a free API for gold prices (example: metals-api.com or similar)
        // For demo purposes, we'll generate realistic data
        // In production, replace with actual API call
        
        $basePrice24K = 60.0; // Base price per gram for 24K gold in EUR
        $basePrice18K = $basePrice24K * 0.75; // 18K is 75% gold
        
        $today = Carbon::today();
        $created = 0;
        $updated = 0;

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

            // Create or update 24K
            if ($existing24K) {
                $existing24K->update([
                    'price_per_gram' => round($price24K, 2),
                ]);
                $updated++;
            } else {
                GoldPriceHistory::create([
                    'karat' => '24K',
                    'price_per_gram' => round($price24K, 2),
                    'currency' => 'EUR',
                    'date_recorded' => $date->format('Y-m-d'),
                ]);
                $created++;
            }

            // Create or update 18K
            if ($existing18K) {
                $existing18K->update([
                    'price_per_gram' => round($price18K, 2),
                ]);
                $updated++;
            } else {
                GoldPriceHistory::create([
                    'karat' => '18K',
                    'price_per_gram' => round($price18K, 2),
                    'currency' => 'EUR',
                    'date_recorded' => $date->format('Y-m-d'),
                ]);
                $created++;
            }
        }

        $this->info("Gold prices fetched successfully!");
        $this->info("Created: {$created} records");
        $this->info("Updated: {$updated} records");
        
        return 0;
    }
}
