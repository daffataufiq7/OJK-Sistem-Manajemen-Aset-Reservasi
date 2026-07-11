<?php

namespace App\Repositories;

use App\Models\Reservation;
use Carbon\Carbon;

class ReservationRepository implements ReservationRepositoryInterface
{
    public function all(array $filters = [])
    {
        $query = Reservation::with(['user.division', 'asset.category']);

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category_id'])) {
            $query->whereHas('asset', function ($q) use ($filters) {
                $q->where('category_id', $filters['category_id']);
            });
        }

        if (isset($filters['division_id'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('division_id', $filters['division_id']);
            });
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->where(function($q) use ($filters) {
                $start = Carbon::parse($filters['start_date'])->startOfDay();
                $end = Carbon::parse($filters['end_date'])->endOfDay();
                $q->whereBetween('start_date', [$start, $end])
                  ->orWhereBetween('end_date', [$start, $end]);
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function find($id)
    {
        return Reservation::with(['user.division', 'asset.category'])->find($id);
    }

    public function findConflicts($assetId, $startDate, $endDate, $excludeId = null)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $query = Reservation::where('asset_id', $assetId)
            ->whereIn('status', ['pending', 'approved', 'reserved', 'in_use'])
            ->where(function ($q) use ($start, $end) {
                $q->where(function ($sub) use ($start, $end) {
                    $sub->where('start_date', '>=', $start)
                        ->where('start_date', '<', $end);
                })
                ->orWhere(function ($sub) use ($start, $end) {
                    $sub->where('end_date', '>', $start)
                        ->where('end_date', '<=', $end);
                })
                ->orWhere(function ($sub) use ($start, $end) {
                    $sub->where('start_date', '<=', $start)
                        ->where('end_date', '>=', $end);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->get();
    }

    public function create(array $data)
    {
        return Reservation::create($data);
    }

    public function update($id, array $data)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update($data);
        return $reservation;
    }

    public function delete($id)
    {
        $reservation = Reservation::findOrFail($id);
        return $reservation->delete();
    }
}
