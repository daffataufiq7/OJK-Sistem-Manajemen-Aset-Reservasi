<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ReservationService;
use App\Repositories\ReservationRepositoryInterface;
use Illuminate\Http\Request;
use Exception;

class ReservationController extends Controller
{
    protected $reservationService;
    protected $reservationRepo;

    public function __construct(
        ReservationService $reservationService,
        ReservationRepositoryInterface $reservationRepo
    ) {
        $this->reservationService = $reservationService;
        $this->reservationRepo = $reservationRepo;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $filters = $request->only(['status', 'category_id', 'division_id', 'start_date', 'end_date']);

        // Business Rule: Pegawai can only see their own reservations
        if ($user->role === 'pegawai') {
            $filters['user_id'] = $user->id;
        }

        $reservations = $this->reservationRepo->all($filters);
        return response()->json($reservations);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $reservation = $this->reservationRepo->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        // Business Rule: Pegawai can only see their own reservations
        if ($user->role === 'pegawai' && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json($reservation);
    }

    public function checkConflict(Request $request)
    {
        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $conflicts = $this->reservationRepo->findConflicts(
            $request->asset_id,
            $request->start_date,
            $request->end_date
        );

        return response()->json([
            'conflict' => $conflicts->count() > 0,
            'details' => $conflicts->map(function ($c) {
                return [
                    'id' => $c->id,
                    'user_name' => $c->user->name,
                    'purpose' => $c->purpose,
                    'start_date' => $c->start_date->toIso8601String(),
                    'end_date' => $c->end_date->toIso8601String(),
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'purpose' => 'required|string',
            'destination' => 'nullable|string',
            'driver_required' => 'nullable|boolean',
            'driver_name' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        try {
            $reservation = $this->reservationService->createReservation($validated);
            return response()->json($reservation, 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function approve(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['validator', 'super_admin'])) {
            return response()->json(['message' => 'Akses ditolak. Hanya Validator atau Admin yang dapat menyetujui.'], 403);
        }

        $validated = $request->validate([
            'driver_name' => 'nullable|string',
        ]);

        try {
            $driverName = $validated['driver_name'] ?? null;
            $reservation = $this->reservationService->approve($id, $request->user()->id, $driverName);
            return response()->json($reservation);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['validator', 'super_admin'])) {
            return response()->json(['message' => 'Akses ditolak. Hanya Validator atau Admin yang dapat menolak.'], 403);
        }

        $request->validate([
            'rejection_reason' => 'required|string|min:5'
        ]);

        try {
            $reservation = $this->reservationService->reject($id, $request->rejection_reason, $request->user()->id);
            return response()->json($reservation);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function startUsage(Request $request, $id)
    {
        try {
            $reservation = $this->reservationService->startUsage($id, $request->user()->id);
            return response()->json($reservation);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function completeUsage(Request $request, $id)
    {
        try {
            $reservation = $this->reservationService->completeUsage($id, $request->user()->id);
            return response()->json($reservation);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function cancel(Request $request, $id)
    {
        $isAdmin = in_array($request->user()->role, ['super_admin', 'validator']);
        try {
            $reservation = $this->reservationService->cancel($id, $request->user()->id, $isAdmin);
            return response()->json($reservation);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['validator', 'super_admin'])) {
            return response()->json(['message' => 'Akses ditolak. Hanya Validator atau Admin yang dapat memperbarui.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,reserved,in_use,completed,cancelled',
            'rejection_reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $reservation = $this->reservationRepo->find($id);
            if (!$reservation) {
                return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
            }

            $oldStatus = $reservation->status;
            $newStatus = $validated['status'];

            if ($oldStatus !== $newStatus) {
                $asset = $reservation->asset;
                if ($asset) {
                    if (in_array($newStatus, ['approved', 'reserved'])) {
                        $asset->status = 'reserved';
                    } elseif ($newStatus === 'in_use') {
                        $asset->status = 'in_use';
                    } elseif (in_array($newStatus, ['completed', 'cancelled', 'rejected'])) {
                        $asset->status = 'available';
                    }
                    $asset->save();
                }
            }

            $reservation = $this->reservationRepo->update($id, $validated);

            AuditLogService::log('update_reservation', "Memperbarui status reservasi ID: {$id} menjadi {$newStatus}", $request->user()->id);

            return response()->json($reservation);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['validator', 'super_admin'])) {
            return response()->json(['message' => 'Akses ditolak. Hanya Validator atau Admin yang dapat menghapus.'], 403);
        }

        try {
            $this->reservationService->deleteReservation($id, $request->user()->id);
            return response()->json(['message' => 'Reservasi berhasil dihapus.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
