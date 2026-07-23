<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->call(function () {
            $now = now();
            // 1. approved/reserved -> in_use
            \App\Models\Reservation::whereIn('status', ['approved', 'reserved'])
                ->where('start_date', '<=', $now)
                ->where('end_date', '>', $now)
                ->chunk(100, function ($reservations) {
                    foreach ($reservations as $res) {
                        $res->status = 'in_use';
                        $res->save();

                        $asset = $res->asset;
                        if ($asset) {
                            $asset->status = 'in_use';
                            $asset->save();
                        }
                    }
                });

            // 2. approved/reserved/in_use -> completed
            \App\Models\Reservation::whereIn('status', ['approved', 'reserved', 'in_use'])
                ->where('end_date', '<=', $now)
                ->chunk(100, function ($reservations) {
                    foreach ($reservations as $res) {
                        $res->status = 'completed';
                        $res->save();

                        $asset = $res->asset;
                        if ($asset && $asset->status === 'in_use') {
                            $hasActive = \App\Models\Reservation::where('asset_id', $asset->id)
                                ->where('id', '!=', $res->id)
                                ->whereIn('status', ['approved', 'reserved', 'in_use'])
                                ->where('start_date', '<=', now())
                                ->where('end_date', '>', now())
                                ->exists();
                            if (!$hasActive) {
                                $asset->status = 'available';
                                $asset->save();
                            }
                        }
                    }
                });
        })->everyMinute();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
