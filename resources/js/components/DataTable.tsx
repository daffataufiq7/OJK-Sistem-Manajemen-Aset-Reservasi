import React, { useState, useMemo } from 'react';
import { Button, Input, Select } from './UI';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

interface Column {
    key: string;
    header: string;
    render?: (item: any) => React.ReactNode;
    sortable?: boolean;
}

interface FilterOption {
    key: string;
    label: string;
    options: { value: string | number; label: string }[];
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    searchKey?: string;
    searchPlaceholder?: string;
    filterOptions?: FilterOption[];
    exportName?: string;
    onRowClick?: (item: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
    columns,
    data,
    searchKey = 'name',
    searchPlaceholder = 'Cari data...',
    filterOptions = [],
    exportName = 'laporan-data',
    onRowClick
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setActiveFilters({});
        setCurrentPage(1);
    };

    // Filter and Search logic
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Search Query Check
            if (searchQuery) {
                const val = searchQuery.toLowerCase();
                // Check direct property or check nested attributes
                const directProp = item[searchKey];
                const matchesSearch = typeof directProp === 'string' 
                    ? directProp.toLowerCase().includes(val) 
                    : JSON.stringify(item).toLowerCase().includes(val);
                
                if (!matchesSearch) return false;
            }

            // Dropdown Filter Checks
            for (const [key, filterVal] of Object.entries(activeFilters)) {
                if (filterVal && filterVal !== 'ALL') {
                    // Check direct key or nested property
                    if (key.includes('.')) {
                        const parts = key.split('.');
                        let current = item;
                        for (const part of parts) {
                            current = current ? current[part] : undefined;
                        }
                        if (String(current) !== String(filterVal)) return false;
                    } else if (String(item[key]) !== String(filterVal)) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [data, searchQuery, activeFilters, searchKey]);

    // Sorting logic
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                
                // Nest support
                if (sortConfig.key.includes('.')) {
                    aVal = sortConfig.key.split('.').reduce((acc, part) => acc?.[part], a);
                    bVal = sortConfig.key.split('.').reduce((acc, part) => acc?.[part], b);
                }

                if (aVal === undefined || aVal === null) return 1;
                if (bVal === undefined || bVal === null) return -1;

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'asc' 
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }

                return sortConfig.direction === 'asc' 
                    ? (aVal > bVal ? 1 : -1)
                    : (bVal > aVal ? 1 : -1);
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    // Pagination bounds
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

    // Trigger Sort
    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    // Filter Change Handler
    const handleFilterChange = (key: string, value: string) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    // Export to CSV
    const exportToCSV = () => {
        // Build CSV content
        const headerRow = columns.map(c => c.header).join(',');
        const rows = sortedData.map(item => {
            return columns.map(col => {
                let cellVal = item[col.key];
                if (col.key.includes('.')) {
                    cellVal = col.key.split('.').reduce((acc, part) => acc?.[part], item);
                }
                // Escape quotes and wrap in quotes
                const cellString = cellVal !== undefined && cellVal !== null ? String(cellVal) : '';
                return `"${cellString.replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headerRow, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${exportName}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4 w-full">
            {/* Header controls (Search & Filter & Export) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 shrink-1 w-full lg:max-w-xl">
                    <div className="relative w-full max-w-sm">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-ojk-red dark:focus:border-ojk-red focus:ring-2 focus:ring-ojk-red/10 text-slate-800 dark:text-slate-200 transition-all"
                        />
                    </div>

                    {filterOptions.map((f, i) => (
                        <div key={i} className="min-w-[140px] max-w-[180px]">
                            <select
                                value={activeFilters[f.key] || 'ALL'}
                                onChange={(e) => handleFilterChange(f.key, e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-350 appearance-none pr-8 cursor-pointer"
                            >
                                <option value="ALL">Semua {f.label}</option>
                                {f.options.map((opt, optIdx) => (
                                    <option key={optIdx} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                    {(searchQuery || Object.values(activeFilters).some(v => v && v !== 'ALL')) && (
                        <button
                            onClick={resetFilters}
                            className="text-xs text-ojk-red hover:underline font-semibold flex items-center cursor-pointer"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 self-end lg:self-auto">
                    <Button variant="outline" size="sm" onClick={exportToCSV} className="text-xs flex items-center gap-1.5 rounded-xl">
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800/60 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => col.sortable !== false && requestSort(col.key)}
                                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200' : ''}`}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.header}</span>
                                        {col.sortable !== false && (
                                            <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`text-slate-700 dark:text-slate-350 text-xs transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30' : ''}`}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4.5 whitespace-nowrap font-medium">
                                            {col.render ? (
                                                col.render(row)
                                            ) : (
                                                col.key.includes('.') ? (
                                                    col.key.split('.').reduce((acc, part) => acc?.[part], row) ?? '-'
                                                ) : (
                                                    row[col.key] ?? '-'
                                                )
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                                    Tidak ada data yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Menampilkan <span className="text-slate-700 dark:text-slate-300">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-slate-700 dark:text-slate-300">{Math.min(currentPage * pageSize, sortedData.length)}</span> dari <span className="text-slate-700 dark:text-slate-300">{sortedData.length}</span> data
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                        <span className="text-xs text-slate-500 font-semibold">Baris per halaman:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                        >
                            {[5, 10, 20, 50].map(sz => (
                                <option key={sz} value={sz}>{sz}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
