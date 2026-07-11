<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\AuditLogService;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(AssetCategory::all());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:asset_categories,name'
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = AssetCategory::create($validated);

        AuditLogService::log('create_category', "Menambahkan kategori baru: {$category->name}", $request->user()->id);

        return response()->json($category, 201);
    }

    public function destroy(Request $request, AssetCategory $category)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Prevent deletion if there are assets belonging to this category
        $assetCount = \App\Models\Asset::where('category_id', $category->id)->count();
        if ($assetCount > 0) {
            return response()->json([
                'message' => "Kategori tidak dapat dihapus karena masih digunakan oleh {$assetCount} aset. Silakan ubah atau hapus aset tersebut terlebih dahulu."
            ], 400);
        }

        $name = $category->name;
        $category->delete();

        AuditLogService::log('delete_category', "Menghapus kategori aset: {$name}", $request->user()->id);

        return response()->json(['message' => "Kategori {$name} berhasil dihapus."]);
    }
}
