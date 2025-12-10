<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GoldPriceHistory;
use Illuminate\Http\Request;
use Carbon\Carbon;

class GoldPriceController extends Controller
{
    public function index(Request $request)
    {
        $karat = $request->query('karat');
        $period = $request->query('period', 'month');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = GoldPriceHistory::query();

        if ($karat) {
            $query->where('karat', $karat);
        }

        // Use custom date range if provided
        if ($startDate && $endDate) {
            $query->whereBetween('date_recorded', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        } else {
            // Use period if no custom dates
            $startDate = match ($period) {
                'day' => Carbon::today(),
                'week' => Carbon::now()->subWeek(),
                'month' => Carbon::now()->subMonth(),
                'year' => Carbon::now()->subYear(),
                default => Carbon::now()->subMonth(),
            };
            $query->where('date_recorded', '>=', $startDate);
        }

        $query->orderBy('date_recorded', 'asc');

        $prices = $query->get();

        // Get latest price for summary
        $latest24K = GoldPriceHistory::where('karat', '24K')
            ->orderBy('date_recorded', 'desc')
            ->first();
        
        $latest18K = GoldPriceHistory::where('karat', '18K')
            ->orderBy('date_recorded', 'desc')
            ->first();

        return response()->json([
            'data' => $prices,
            'latest' => [
                '24K' => $latest24K ? [
                    'price_per_gram' => $latest24K->price_per_gram,
                    'currency' => $latest24K->currency,
                    'date' => $latest24K->date_recorded->format('Y-m-d'),
                ] : null,
                '18K' => $latest18K ? [
                    'price_per_gram' => $latest18K->price_per_gram,
                    'currency' => $latest18K->currency,
                    'date' => $latest18K->date_recorded->format('Y-m-d'),
                ] : null,
            ],
        ]);
    }
}













