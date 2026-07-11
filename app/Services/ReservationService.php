<?php

namespace App\Services;

use App\Repositories\ReservationRepositoryInterface;
use App\Repositories\AssetRepositoryInterface;
use App\Models\Notification;
use App\Models\User;
use Exception;
use Carbon\Carbon;

class ReservationService
{
    protected $reservationRepo;
    protected $assetRepo;

    public function __construct(
        ReservationRepositoryInterface $reservationRepo,
        AssetRepositoryInterface $assetRepo
    ) {
        $this->reservationRepo = $reservationRepo;
        $this->assetRepo = $assetRepo;
    }

    public function createReservation(array $data)
    {
        $asset = $this->assetRepo->find($data['asset_id']);

        if (!$asset) {
            throw new Exception('Asset tidak ditemukan.');
        }

        if (in_array($asset->status, ['maintenance', 'inactive'])) {
            throw new Exception('Asset sedang dalam masa perawatan (maintenance) atau tidak aktif.');
        }

        // Check conflicts
        $conflicts = $this->reservationRepo->findConflicts(
            $data['asset_id'],
            $data['start_date'],
            $data['end_date']
        );

        if ($conflicts->count() > 0) {
            throw new Exception('Jadwal bentrok dengan peminjaman lain yang sudah disetujui atau sedang berjalan.');
        }

        $data['status'] = 'pending';
        $reservation = $this->reservationRepo->create($data);

        // Notify Validators
        $validators = User::where('role', 'validator')->get();
        foreach ($validators as $val) {
            Notification::create([
                'user_id' => $val->id,
                'title' => 'Pengajuan Reservasi Baru',
                'message' => "Pengajuan peminjaman {$asset->name} oleh {$reservation->user->name} menunggu persetujuan Anda.",
                'type' => 'approval',
                'is_read' => false,
            ]);
        }

        AuditLogService::log('create_reservation', "Mengajukan reservasi untuk {$asset->name} (ID: {$reservation->id})", $data['user_id']);

        return $reservation;
    }

    public function approve($id, $validatorId)
    {
        $reservation = $this->reservationRepo->find($id);

        if (!$reservation) {
            throw new Exception('Reservasi tidak ditemukan.');
        }

        if ($reservation->status !== 'pending') {
            throw new Exception('Reservasi tidak dalam status pending.');
        }

        // Double check conflicts
        $conflicts = $this->reservationRepo->findConflicts(
            $reservation->asset_id,
            $reservation->start_date,
            $reservation->end_date,
            $reservation->id
        );

        if ($conflicts->count() > 0) {
            throw new Exception('Gagal menyetujui. Terdapat bentrok jadwal dengan reservasi lain yang baru disetujui.');
        }

        $reservation->status = 'approved';
        $reservation->save();

        // Update asset status
        $asset = $reservation->asset;
        $asset->status = 'reserved';
        $asset->save();

        // Notify applicant
        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => 'Reservasi Disetujui',
            'message' => "Reservasi Anda untuk {$asset->name} pada tanggal " . Carbon::parse($reservation->start_date)->format('d M Y') . " telah disetujui.",
            'type' => 'approval',
            'is_read' => false,
        ]);

        AuditLogService::log('approve_reservation', "Menyetujui reservasi ID: {$reservation->id} untuk {$asset->name}", $validatorId);

        return $reservation;
    }

    public function reject($id, $reason, $validatorId)
    {
        $reservation = $this->reservationRepo->find($id);

        if (!$reservation) {
            throw new Exception('Reservasi tidak ditemukan.');
        }

        if ($reservation->status !== 'pending') {
            throw new Exception('Reservasi tidak dalam status pending.');
        }

        $reservation->status = 'rejected';
        $reservation->rejection_reason = $reason;
        $reservation->save();

        // Notify applicant
        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => 'Reservasi Ditolak',
            'message' => "Reservasi Anda untuk {$reservation->asset->name} ditolak. Alasan: {$reason}",
            'type' => 'reject',
            'is_read' => false,
        ]);

        AuditLogService::log('reject_reservation', "Menolak reservasi ID: {$reservation->id}. Alasan: {$reason}", $validatorId);

        return $reservation;
    }

    public function startUsage($id, $actorId)
    {
        $reservation = $this->reservationRepo->find($id);

        if (!$reservation) {
            throw new Exception('Reservasi tidak ditemukan.');
        }

        $reservation->status = 'in_use';
        $reservation->save();

        $asset = $reservation->asset;
        $asset->status = 'in_use';
        $asset->save();

        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => 'Aset Sedang Digunakan',
            'message' => "Peminjaman {$asset->name} Anda telah aktif (In Use).",
            'type' => 'approval',
            'is_read' => false,
        ]);

        AuditLogService::log('start_usage', "Memulai penggunaan aset {$asset->name} (Reservasi ID: {$reservation->id})", $actorId);

        return $reservation;
    }

    public function completeUsage($id, $actorId)
    {
        $reservation = $this->reservationRepo->find($id);

        if (!$reservation) {
            throw new Exception('Reservasi tidak ditemukan.');
        }

        $reservation->status = 'completed';
        $reservation->save();

        $asset = $reservation->asset;
        $asset->status = 'available';
        $asset->save();

        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => 'Aset Telah Dikembalikan',
            'message' => "Terima kasih, Anda telah mengembalikan {$asset->name}.",
            'type' => 'return',
            'is_read' => false,
        ]);

        AuditLogService::log('complete_usage', "Mengembalikan aset {$asset->name} (Reservasi ID: {$reservation->id})", $actorId);

        return $reservation;
    }

    public function cancel($id, $userId, $isAdmin = false)
    {
        $reservation = $this->reservationRepo->find($id);

        if (!$reservation) {
            throw new Exception('Reservasi tidak ditemukan.');
        }

        if ($reservation->user_id !== $userId && !$isAdmin) {
            throw new Exception('Anda tidak memiliki akses untuk membatalkan reservasi ini.');
        }

        $reservation->status = 'cancelled';
        $reservation->save();

        $asset = $reservation->asset;
        if (in_array($asset->status, ['reserved', 'in_use'])) {
            $asset->status = 'available';
            $asset->save();
        }

        AuditLogService::log('cancel_reservation', "Membatalkan reservasi ID: {$reservation->id} untuk {$asset->name}", $userId);

        return $reservation;
    }
}
