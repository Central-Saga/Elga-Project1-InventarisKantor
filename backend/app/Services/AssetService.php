<?php

namespace App\Services;

use App\Models\Asset;
use App\Repositories\Contracts\AssetRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AssetService
{
    public function __construct(
        private readonly AssetRepositoryInterface $assets,
        private readonly AssetCodeGenerator $codes,
        private readonly ActivityLogService $activityLog,
    ) {}

    public function paginate(int $perPage): LengthAwarePaginator
    {
        return $this->assets->paginateWithCategory($perPage);
    }

    public function find(int $id): Asset
    {
        return $this->assets->find($id);
    }

    public function create(array $attributes, ?UploadedFile $photo = null): Asset
    {
        $attributes['asset_code'] = $this->codes->nextAssetCode();
        if ($photo) {
            $attributes['photo_path'] = $photo->store('assets', 'public');
        }

        $asset = $this->assets->create($attributes);
        $this->activityLog->record('asset.created', Asset::class, $asset->id, $attributes);

        return $this->assets->loadCategory($asset);
    }

    public function update(int $id, array $attributes, ?UploadedFile $photo = null): Asset
    {
        return DB::transaction(function () use ($id, $attributes, $photo): Asset {
            $asset = $this->assets->findForUpdate($id);
            if ($photo) {
                if ($asset->photo_path) {
                    Storage::disk('public')->delete($asset->photo_path);
                }
                $attributes['photo_path'] = $photo->store('assets', 'public');
            }

            $asset->fill($attributes);
            $this->assets->save($asset);
            $this->activityLog->record('asset.updated', Asset::class, $asset->id, [
                'before' => $asset->getOriginal(),
                'after' => $attributes,
            ]);

            return $this->assets->loadCategory($asset);
        });
    }

    public function delete(int $id): void
    {
        $asset = $this->assets->find($id);
        if ($asset->photo_path) {
            Storage::disk('public')->delete($asset->photo_path);
        }

        $this->assets->delete($asset);
        $this->activityLog->record('asset.deleted', Asset::class, $asset->id, [
            'name' => $asset->name,
            'asset_code' => $asset->asset_code,
        ]);
    }
}
