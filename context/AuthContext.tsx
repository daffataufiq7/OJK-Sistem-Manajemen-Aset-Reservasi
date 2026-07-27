'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('ojk_asset_token');
        if (storedToken) {
            setToken(storedToken);
        }
        fetchCurrentUser(storedToken || undefined);

        const safetyTimer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(safetyTimer);
    }, []);

    const fetchCurrentUser = async (authToken?: string) => {
        try {
            const headers: Record<string, string> = {};
            const activeToken = authToken || token || localStorage.getItem('ojk_asset_token');
            if (activeToken) {
                headers['Authorization'] = `Bearer ${activeToken}`;
            }

            const res = await fetch('/api/auth/me', { headers });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else if (res.status === 401) {
                logoutAction();
            }
        } catch (error) {
            console.error('Failed to fetch user profile', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier: string, password: string): Promise<User> => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setLoading(false);
                throw new Error(data.message || 'Login gagal.');
            }

            const { access_token, user: loggedUser } = data;

            localStorage.setItem('ojk_asset_token', access_token);
            setToken(access_token);
            setUser(loggedUser);
            setLoading(false);
            return loggedUser;
        } catch (error: any) {
            setLoading(false);
            throw new Error(error.message || 'Login gagal. Periksa koneksi Anda.');
        }
    };

    const logoutAction = () => {
        localStorage.removeItem('ojk_asset_token');
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    const logout = async (): Promise<void> => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            logoutAction();
            window.location.href = '/login';
        }
    };

    const refreshUser = async (): Promise<void> => {
        await fetchCurrentUser();
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
