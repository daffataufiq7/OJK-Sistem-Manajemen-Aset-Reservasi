import React, { useState, useEffect } from 'react';

// ==========================================
// BUTTON
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    children, 
    ...props 
}) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-ojk-red text-white hover:bg-ojk-red-hover active:scale-98 shadow-sm',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-98',
        outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 active:scale-98',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-98 shadow-sm',
        ghost: 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-base'
    };

    return (
        <button 
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};

// ==========================================
// CARD
// ==========================================
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
    <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl soft-shadow transition-all duration-200 ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
    <div className={`p-6 pb-4 border-b border-slate-50 dark:border-slate-800/50 flex flex-col space-y-1.5 ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
    <h3 className={`text-lg font-bold text-slate-850 dark:text-slate-100 tracking-tight ${className}`} {...props}>
        {children}
    </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', children, ...props }) => (
    <p className={`text-xs text-slate-500 dark:text-slate-400 ${className}`} {...props}>
        {children}
    </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
    <div className={`p-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-end space-x-2 ${className}`} {...props}>
        {children}
    </div>
);

// ==========================================
// INPUT & TEXTAREA & SELECT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
    <div className="flex flex-col space-y-1.5 w-full">
        {label && <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">{label}</label>}
        <input 
            className={`px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-ojk-red dark:focus:border-ojk-red focus:ring-2 focus:ring-ojk-red/10 text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400 ${error ? 'border-red-500' : ''} ${className}`} 
            {...props} 
        />
        {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
    </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => (
    <div className="flex flex-col space-y-1.5 w-full">
        {label && <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">{label}</label>}
        <textarea 
            className={`px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-ojk-red dark:focus:border-ojk-red focus:ring-2 focus:ring-ojk-red/10 text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400 min-h-[100px] ${error ? 'border-red-500' : ''} ${className}`} 
            {...props} 
        />
        {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => (
    <div className="flex flex-col space-y-1.5 w-full">
        {label && <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">{label}</label>}
        <div className="relative">
            <select 
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-ojk-red dark:focus:border-ojk-red focus:ring-2 focus:ring-ojk-red/10 text-slate-850 dark:text-slate-200 transition-all appearance-none cursor-pointer ${error ? 'border-red-500' : ''} ${className}`} 
                {...props}
            >
                {options.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>
        </div>
        {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
    </div>
);

// ==========================================
// BADGE
// ==========================================
export const Badge: React.FC<{ 
    status: string; 
    className?: string; 
}> = ({ status, className = '' }) => {
    const s = status.toLowerCase();

    // Map labels and colors
    let text = status;
    let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

    if (s === 'available' || s === 'tersedia') {
        text = 'Tersedia';
        style = 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
    } else if (s === 'reserved' || s === 'disetujui') {
        text = s === 'disetujui' ? 'Disetujui' : 'Reserved';
        style = 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
    } else if (s === 'in_use' || s === 'sedang dipakai' || s === 'in use') {
        text = 'Sedang Dipakai';
        style = 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
    } else if (s === 'maintenance' || s === 'perawatan') {
        text = 'Maintenance';
        style = 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30';
    } else if (s === 'inactive' || s === 'tidak aktif') {
        text = 'Tidak Aktif';
        style = 'bg-slate-100 text-slate-650 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-750';
    } else if (s === 'pending' || s === 'menunggu') {
        text = 'Menunggu';
        style = 'bg-yellow-50 text-yellow-750 border border-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/30';
    } else if (s === 'rejected' || s === 'ditolak') {
        text = 'Ditolak';
        style = 'bg-red-50 text-red-750 border border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30';
    } else if (s === 'completed' || s === 'selesai') {
        text = 'Selesai';
        style = 'bg-slate-50 text-slate-600 border border-slate-100 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800';
    } else if (s === 'cancelled' || s === 'dibatalkan') {
        text = 'Batal';
        style = 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-750';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${style} ${className}`}>
            {text}
        </span>
    );
};

// ==========================================
// DIALOG (MODAL)
// ==========================================
interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md' 
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity" 
                onClick={onClose}
            />
            
            {/* Content Container */}
            <div className={`relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full rounded-2xl shadow-xl transform transition-all duration-300 ${sizes[size]} z-10 my-8`}>
                <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800/50">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                    <button 
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                        onClick={onClose}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// TOAST NOTIFICATIONS SERVICE
// ==========================================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

let toastManager: (message: string, type: ToastType) => void = () => {};

export const toast = {
    success: (msg: string) => toastManager(msg, 'success'),
    error: (msg: string) => toastManager(msg, 'error'),
    info: (msg: string) => toastManager(msg, 'info'),
    warning: (msg: string) => toastManager(msg, 'warning'),
};

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        toastManager = (message: string, type: ToastType) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 4000);
        };
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (toasts.length === 0) return null;

    const bgColors = {
        success: 'bg-emerald-600 text-white dark:bg-emerald-500',
        error: 'bg-red-600 text-white dark:bg-red-500',
        info: 'bg-blue-600 text-white dark:bg-blue-500',
        warning: 'bg-amber-500 text-white dark:bg-amber-500',
    };

    const icons = {
        success: (
            <svg className="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
    };

    return (
        <div className="fixed bottom-5 right-5 z-55 flex flex-col space-y-2 max-w-sm w-full">
            {toasts.map((t) => (
                <div 
                    key={t.id} 
                    className={`flex items-center justify-between p-4 rounded-xl shadow-lg animate-fade-in-up duration-250 ${bgColors[t.type]}`}
                >
                    <div className="flex items-center">
                        {icons[t.type]}
                        <span className="text-xs font-semibold">{t.message}</span>
                    </div>
                    <button 
                        onClick={() => removeToast(t.id)} 
                        className="ml-4 shrink-0 text-white/70 hover:text-white p-0.5 hover:bg-white/10 rounded-md transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

// ==========================================
// BREADCRUMB
// ==========================================
export const Breadcrumb: React.FC<{
    items: { label: string; href?: string }[];
}> = ({ items }) => (
    <nav className="flex text-xs font-semibold text-slate-500 dark:text-slate-400 space-x-1.5 items-center">
        {items.map((item, index) => (
            <React.Fragment key={index}>
                {index > 0 && <span className="text-slate-350 select-none">/</span>}
                {item.href ? (
                    <a href={item.href} className="hover:text-ojk-red dark:hover:text-ojk-red transition-colors">
                        {item.label}
                    </a>
                ) : (
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                )}
            </React.Fragment>
        ))}
    </nav>
);
