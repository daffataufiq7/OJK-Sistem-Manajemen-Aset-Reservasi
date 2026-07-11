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
    division_id: number | null;
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
    category_id: number;
    location: string;
    status: AssetStatus;
    condition: AssetCondition;
    photo: string | null;
    qr_code: string | null;
    maintenance_schedule: string | null;
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
    user_id: number;
    asset_id: number;
    start_date: string;
    end_date: string;
    purpose: string;
    destination: string | null;
    driver_required: boolean;
    driver_name: string | null;
    duty_letter_path: string | null;
    notes: string | null;
    status: ReservationStatus;
    rejection_reason: string | null;
    user?: User;
    asset?: Asset;
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'approval' | 'reject' | 'reminder' | 'maintenance' | 'return';
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: User;
}
