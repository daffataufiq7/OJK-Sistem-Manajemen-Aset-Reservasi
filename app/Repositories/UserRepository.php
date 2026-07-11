<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository implements UserRepositoryInterface
{
    public function all()
    {
        return User::with('division')->get();
    }

    public function find($id)
    {
        return User::with('division')->find($id);
    }

    public function findByNipOrEmail($identifier)
    {
        return User::where('nip', $identifier)
            ->orWhere('email', $identifier)
            ->first();
    }

    public function create(array $data)
    {
        return User::create($data);
    }

    public function update($id, array $data)
    {
        $user = User::findOrFail($id);
        $user->update($data);
        return $user;
    }

    public function delete($id)
    {
        $user = User::findOrFail($id);
        return $user->delete();
    }
}
