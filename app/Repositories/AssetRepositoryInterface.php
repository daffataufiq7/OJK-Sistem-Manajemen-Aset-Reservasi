<?php

namespace App\Repositories;

interface AssetRepositoryInterface
{
    public function all(array $filters = []);
    public function find($id);
    public function findByCode($code);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}
