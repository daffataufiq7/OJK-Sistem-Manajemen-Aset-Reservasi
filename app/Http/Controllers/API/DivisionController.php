<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\Request;
use App\Services\AuditLogService;

class DivisionController extends Controller
{
    public function index()
    {
        return response()->json(Division::all());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:divisions,name'
        ]);

        $division = Division::create($validated);
        
        AuditLogService::log('create_division', "Menambahkan divisi baru: {$division->name}", $request->user()->id);

        return response()->json($division, 201);
    }

    public function destroy(Request $request, Division $division)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Set division_id to null for users in this division
        \App\Models\User::where('division_id', $division->id)->update(['division_id' => null]);

        $name = $division->name;
        $division->delete();

        AuditLogService::log('delete_division', "Menghapus divisi: {$name}", $request->user()->id);

        return response()->json(['message' => "Divisi {$name} berhasil dihapus."]);
    }
}
