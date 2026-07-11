<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Repositories\AssetRepositoryInterface;
use App\Services\AuditLogService;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    protected $assetRepo;

    public function __construct(AssetRepositoryInterface $assetRepo)
    {
        $this->assetRepo = $assetRepo;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['category', 'status', 'search']);
        $assets = $this->assetRepo->all($filters);
        return response()->json($assets);
    }

    public function show($id)
    {
        $asset = $this->assetRepo->find($id);
        if (!$asset) {
            return response()->json(['message' => 'Aset tidak ditemukan.'], 404);
        }
        return response()->json($asset);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|unique:assets,code',
            'name' => 'required|string',
            'category_id' => 'required|exists:asset_categories,id',
            'location' => 'required|string',
            'status' => 'required|string|in:available,reserved,in_use,maintenance,inactive',
            'condition' => 'required|string|in:good,fair,poor',
            'photo' => 'nullable|string',
            'maintenance_schedule' => 'nullable|date',
        ]);

        $validated['qr_code'] = "{$validated['code']}|{$validated['name']}|OJK Jawa Barat";

        $asset = $this->assetRepo->create($validated);

        AuditLogService::log('create_asset', "Menambahkan aset baru: {$asset->name} (Kode: {$asset->code})", $request->user()->id);

        return response()->json($asset, 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|unique:assets,code,' . $id,
            'name' => 'required|string',
            'category_id' => 'required|exists:asset_categories,id',
            'location' => 'required|string',
            'status' => 'required|string|in:available,reserved,in_use,maintenance,inactive',
            'condition' => 'required|string|in:good,fair,poor',
            'photo' => 'nullable|string',
            'maintenance_schedule' => 'nullable|date',
        ]);

        $validated['qr_code'] = "{$validated['code']}|{$validated['name']}|OJK Jawa Barat";

        $asset = $this->assetRepo->update($id, $validated);

        AuditLogService::log('update_asset', "Mengubah detail aset: {$asset->name} (Kode: {$asset->code})", $request->user()->id);

        return response()->json($asset);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $asset = $this->assetRepo->find($id);
        if (!$asset) {
            return response()->json(['message' => 'Aset tidak ditemukan.'], 404);
        }

        $this->assetRepo->delete($id);

        AuditLogService::log('delete_asset', "Menghapus aset (soft delete): {$asset->name} (Kode: {$asset->code})", $request->user()->id);

        return response()->json(['message' => 'Aset berhasil dihapus.']);
    }
}
