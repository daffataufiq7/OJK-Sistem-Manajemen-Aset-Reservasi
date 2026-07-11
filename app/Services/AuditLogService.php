<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditLogService
{
    public static function log($action, $description, $userId = null)
    {
        $uid = $userId ?? Auth::id();
        
        AuditLog::create([
            'user_id' => $uid,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
