<?php

namespace App\Providers;

use App\Models\Asset;
use App\Models\Atk;
use App\Models\User;
use App\Policies\AssetPolicy;
use App\Policies\AtkPolicy;
use App\Policies\UserPolicy;
use App\Repositories\Contracts\AssetLoanRepositoryInterface;
use App\Repositories\Contracts\AssetRepositoryInterface;
use App\Repositories\Contracts\AtkRepositoryInterface;
use App\Repositories\Contracts\AtkRequestRepositoryInterface;
use App\Repositories\Contracts\AtkTransactionRepositoryInterface;
use App\Repositories\Eloquent\EloquentAssetLoanRepository;
use App\Repositories\Eloquent\EloquentAssetRepository;
use App\Repositories\Eloquent\EloquentAtkRepository;
use App\Repositories\Eloquent\EloquentAtkRequestRepository;
use App\Repositories\Eloquent\EloquentAtkTransactionRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AssetRepositoryInterface::class, EloquentAssetRepository::class);
        $this->app->bind(AssetLoanRepositoryInterface::class, EloquentAssetLoanRepository::class);
        $this->app->bind(AtkRepositoryInterface::class, EloquentAtkRepository::class);
        $this->app->bind(AtkRequestRepositoryInterface::class, EloquentAtkRequestRepository::class);
        $this->app->bind(AtkTransactionRepositoryInterface::class, EloquentAtkTransactionRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Asset::class, AssetPolicy::class);
        Gate::policy(Atk::class, AtkPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        Model::preventLazyLoading(! app()->isProduction());
    }
}
