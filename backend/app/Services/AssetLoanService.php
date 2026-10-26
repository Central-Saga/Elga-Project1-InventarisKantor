<?php

namespace App\Services;

use App\Models\AssetLoan;
use App\Models\User;
use App\Repositories\Contracts\AssetLoanRepositoryInterface;
use App\Repositories\Contracts\AssetRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssetLoanService
{
    public function __construct(
        private readonly AssetRepositoryInterface $assets,
        private readonly AssetLoanRepositoryInterface $loans,
    ) {}

    public function paginate(?int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->loans->paginateForUser($userId, $perPage);
    }

    public function find(int $id): AssetLoan
    {
        return $this->loans->find($id);
    }

    public function create(array $attributes, User $user): AssetLoan
    {
        return DB::transaction(function () use ($attributes, $user): AssetLoan {
            $asset = $this->assets->findForUpdate($attributes['asset_id']);
            if ($asset->status !== 'available' || $asset->stock < 1) {
                throw ValidationException::withMessages([
                    'asset_id' => ['Aset sedang tidak tersedia untuk dipinjam.'],
                ]);
            }

            $this->assets->adjustStock($asset, -1);
            if ($asset->stock <= 0) {
                $asset->status = 'borrowed';
                $this->assets->save($asset);
            }

            return $this->loans->create([
                ...$attributes,
                'user_id' => $user->id,
                'borrower_name' => $user->name,
                'status' => 'pending',
            ]);
        });
    }

    public function updateStatus(int $id, string $status): AssetLoan
    {
        return DB::transaction(function () use ($id, $status): AssetLoan {
            $loan = $this->loans->findForUpdate($id);
            if ($loan->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => ['Permintaan ini sudah diproses.'],
                ]);
            }

            $asset = $this->assets->findForUpdate($loan->asset_id);
            if ($status === 'rejected') {
                $this->assets->adjustStock($asset, 1);
                $asset->status = 'available';
                $this->assets->save($asset);
            } else {
                $asset->status = $asset->stock > 0 ? 'available' : 'borrowed';
                $this->assets->save($asset);
            }

            $loan->status = $status;
            $this->loans->save($loan);

            return $this->loans->freshWithRelations($loan);
        });
    }

    public function requestReturn(int $id): AssetLoan
    {
        return DB::transaction(function () use ($id): AssetLoan {
            $loan = $this->loans->findForUpdate($id);
            if (! in_array($loan->status, ['approved', 'borrowed'], true)) {
                throw ValidationException::withMessages([
                    'status' => ['Pengajuan pengembalian tidak dapat dibuat untuk status ini.'],
                ]);
            }

            $loan->status = 'return_requested';
            $this->loans->save($loan);

            return $this->loans->freshWithRelations($loan);
        });
    }

    public function returnAsset(int $id, string $condition, bool $isAdminOwnedLoan): AssetLoan
    {
        return DB::transaction(function () use ($id, $condition, $isAdminOwnedLoan): AssetLoan {
            $loan = $this->loans->findForUpdate($id);
            $isAllowedAdminReturn = $isAdminOwnedLoan
                && in_array($loan->status, ['approved', 'borrowed'], true);
            if ($loan->status !== 'return_requested' && ! $isAllowedAdminReturn) {
                throw ValidationException::withMessages([
                    'status' => ['Aset harus diajukan pengembaliannya oleh peminjam terlebih dahulu.'],
                ]);
            }

            $loan->status = 'returned';
            $loan->return_date = now()->format('Y-m-d');
            $loan->return_condition = $condition;
            $this->loans->save($loan);

            if ($loan->asset) {
                $asset = $this->assets->findForUpdate($loan->asset_id);
                $this->assets->adjustStock($asset, 1);
                $asset->status = 'available';
                $this->assets->save($asset);
            }

            return $this->loans->freshWithRelations($loan);
        });
    }
}
