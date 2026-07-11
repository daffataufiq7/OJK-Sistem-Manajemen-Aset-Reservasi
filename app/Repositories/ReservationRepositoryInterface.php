<?php

namespace App\Repositories;

interface ReservationRepositoryInterface
{
    public function all(array $filters = []);
    public function find($id);
    public function findConflicts($assetId, $startDate, $endDate, $excludeId = null);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}
