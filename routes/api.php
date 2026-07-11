<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\AssetController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\CalendarController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\AuditLogController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DivisionController;
use App\Http\Controllers\API\CategoryController;

// Public route
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard analytics
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Assets CRUD
    Route::apiResource('assets', AssetController::class);

    // Reservations
    Route::get('/reservations/check-conflict', [ReservationController::class, 'checkConflict']);
    Route::post('/reservations/{id}/approve', [ReservationController::class, 'approve']);
    Route::post('/reservations/{id}/reject', [ReservationController::class, 'reject']);
    Route::post('/reservations/{id}/start-usage', [ReservationController::class, 'startUsage']);
    Route::post('/reservations/{id}/complete-usage', [ReservationController::class, 'completeUsage']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    Route::apiResource('reservations', ReservationController::class);

    // Calendar
    Route::get('/calendar/events', [CalendarController::class, 'index']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    // Users CRUD
    Route::apiResource('users', UserController::class);

    // Divisions
    Route::get('/divisions', [DivisionController::class, 'index']);
    Route::post('/divisions', [DivisionController::class, 'store']);
    Route::delete('/divisions/{division}', [DivisionController::class, 'destroy']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});
