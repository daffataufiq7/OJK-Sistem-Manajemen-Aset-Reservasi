export interface DriverInfo {
    id: number;
    name: string;
    phone: string;
    nip: string;
}

export const DRIVER_LIST: DriverInfo[] = [
    { id: 1, name: 'Supriyadi', phone: '0812-3456-7890', nip: 'DRV-001' },
    { id: 2, name: 'Budi Santoso', phone: '0813-9876-5432', nip: 'DRV-002' },
    { id: 3, name: 'Agus Setiawan', phone: '0857-1122-3344', nip: 'DRV-003' },
    { id: 4, name: 'Dedi Kurniawan', phone: '0821-4455-6677', nip: 'DRV-004' },
    { id: 5, name: 'Eko Prasetyo', phone: '0878-3322-1100', nip: 'DRV-005' },
    { id: 6, name: 'Bambang Suherman', phone: '0899-7766-5544', nip: 'DRV-006' },
];
