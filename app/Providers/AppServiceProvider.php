<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\UserRepositoryInterface::class,
            \App\Repositories\UserRepository::class
        );
        $this->app->bind(
            \App\Repositories\AssetRepositoryInterface::class,
            \App\Repositories\AssetRepository::class
        );
        $this->app->bind(
            \App\Repositories\ReservationRepositoryInterface::class,
            \App\Repositories\ReservationRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (str_contains(request()->header('X-Forwarded-Proto', ''), 'https')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
