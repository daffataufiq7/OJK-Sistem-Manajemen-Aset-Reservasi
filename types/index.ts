export interface Division {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface AssetCategory {
    id: number;
    name: string;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

export type UserRole = 'super_admin' | 'validator' | 'pegawai';

export interface User {
    id: number;
    name: string;
    nip: string;
    email: string;
    role: UserRole;
    division_id?: number | null;
    divisionId?: number | null;
    division?: Division;
    created_at?: string;
    updated_at?: string;
}

export type AssetStatus = 'available' | 'reserved' | 'in_use' | 'maintenance' | 'inactive';
export type AssetCondition = 'good' | 'fair' | 'poor';

export interface Asset {
    id: number;
    code: string;
    name: string;
    category_id?: number;
    categoryId?: number;
    location: string;
    status: AssetStatus;
    condition: AssetCondition;
    photo?: string | null;
    qr_code?: string | null;
    qrCode?: string | null;
    maintenance_schedule?: string | null;
    category?: AssetCategory;
    created_at?: string;
    updated_at?: string;
}

export type ReservationStatus = 
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'reserved'
    | 'in_use'
    | 'completed'
    | 'cancelled';

export interface Reservation {
    id: number;
    user_id?: number;
    userId?: number;
    asset_id?: number;
    assetId?: number;
    start_date: string;
    startDate?: string;
    end_date: string;
    endDate?: string;
    purpose: string;
    destination?: string | null;
    driver_required?: boolean;
    driverRequired?: boolean;
    driver_name?: string | null;
    driverName?: string | null;
    duty_letter_path?: string | null;
    notes?: string | null;
    status: ReservationStatus;
    rejection_reason?: string | null;
    rejectionReason?: string | null;
    user?: User;
    asset?: Asset;
    created_at: string;
    updated_at?: string;
}

export interface Notification {
    id: number;
    user_id?: number;
    userId?: number;
    title: string;
    message: string;
    type: 'approval' | 'reject' | 'reminder' | 'maintenance' | 'return' | 'info';
    is_read?: boolean;
    isRead?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AuditLog {
    id: number;
    user_id?: number | null;
    userId?: number | null;
    action: string;
    description: string;
    ip_address?: string | null;
    ipAddress?: string | null;
    user_agent?: string | null;
    userAgent?: string | null;
    created_at?: string;
    user?: User;
}
