<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\AuditLogService;

class AuthController extends Controller
{
    protected $userRepo;

    public function __construct(UserRepositoryInterface $userRepo)
    {
        $this->userRepo = $userRepo;
    }

    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string', // NIP or Email
            'password' => 'required|string',
        ]);

        $user = $this->userRepo->findByNipOrEmail($request->identifier);

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'NIP/Email atau password salah.'
            ], 401);
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLogService::log('login', "Pegawai {$user->name} berhasil login ke sistem.", $user->id);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('division'),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('division'));
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        AuditLogService::log('logout', "Pegawai {$user->name} berhasil logout.", $user->id);

        return response()->json([
            'message' => 'Logout berhasil.'
        ]);
    }
}
