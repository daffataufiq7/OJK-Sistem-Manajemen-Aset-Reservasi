<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Reservation::with(['user', 'asset.category'])
            ->whereNotIn('status', ['rejected', 'cancelled']);

        // Pegawai only sees their own calendar events or all?
        // Usually, in a shared scheduling system, everyone should see all bookings on the calendar
        // so that they know when assets are booked, but we can filter if requested.
        // We will show all events to prevent double booking attempts manually.

        $reservations = $query->get();

        $events = $reservations->map(function ($res) {
            // Determine color based on status
            // pending: yellow, approved/reserved: blue, in_use: green/orange, completed: gray
            $color = '#EAB308'; // Pending (Yellow)
            if ($res->status === 'approved' || $res->status === 'reserved') {
                $color = '#3B82F6'; // Approved (Blue)
            } elseif ($res->status === 'in_use') {
                $color = '#F97316'; // In Use (Orange)
            } elseif ($res->status === 'completed') {
                $color = '#10B981'; // Completed (Green)
            }

            return [
                'id' => $res->id,
                'title' => $res->asset->name . ' (' . ($res->user->name ?? 'Pegawai') . ')',
                'start' => $res->start_date->toIso8601String(),
                'end' => $res->end_date->toIso8601String(),
                'color' => $color,
                'textColor' => '#FFFFFF',
                'extendedProps' => [
                    'asset_name' => $res->asset->name,
                    'asset_code' => $res->asset->code,
                    'category' => $res->asset->category->name ?? '',
                    'applicant' => $res->user->name ?? '',
                    'division' => $res->user->division->name ?? '-',
                    'purpose' => $res->purpose,
                    'status' => $res->status,
                    'notes' => $res->notes,
                ]
            ];
        });

        return response()->json($events);
    }
}
