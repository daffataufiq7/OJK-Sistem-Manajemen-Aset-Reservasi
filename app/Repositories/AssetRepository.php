<?php

namespace App\Repositories;

use App\Models\Asset;

class AssetRepository implements AssetRepositoryInterface
{
    public function all(array $filters = [])
    {
        $query = Asset::with('category');

        if (isset($filters['category'])) {
            $query->whereHas('category', function ($q) use ($filters) {
                $q->where('slug', $filters['category']);
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    public function find($id)
    {
        return Asset::with('category')->find($id);
    }

    public function findByCode($code)
    {
        return Asset::with('category')->where('code', $code)->first();
    }

    public function create(array $data)
    {
        return Asset::create($data);
    }

    public function update($id, array $data)
    {
        $asset = Asset::findOrFail($id);
        $asset->update($data);
        return $asset;
    }

    public function delete($id)
    {
        $asset = Asset::findOrFail($id);
        return $asset->delete();
    }
}
