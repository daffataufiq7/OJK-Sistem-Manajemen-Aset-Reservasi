<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $users = User::with('division')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'nip' => 'required|string|unique:users,nip',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:super_admin,validator,pegawai',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        AuditLogService::log('create_user', "Membuat user baru: {$user->name} (NIP: {$user->nip})", $request->user()->id);

        return response()->json($user->load('division'), 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'nip' => 'required|string|unique:users,nip,' . $id,
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|in:super_admin,validator,pegawai',
            'division_id' => 'required|exists:divisions,id',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        AuditLogService::log('update_user', "Mengubah detail user: {$user->name} (NIP: {$user->nip})", $request->user()->id);

        return response()->json($user->load('division'));
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $user = User::findOrFail($id);
        
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Anda tidak bisa menghapus akun Anda sendiri.'], 422);
        }

        $user->delete();

        AuditLogService::log('delete_user', "Menghapus user (soft delete): {$user->name} (NIP: {$user->nip})", $request->user()->id);

        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
