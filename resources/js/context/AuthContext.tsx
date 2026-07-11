import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

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
    const [token, setToken] = useState<string | null>(localStorage.getItem('ojk_asset_token'));
    const [loading, setLoading] = useState<boolean>(true);

    // Set axios baseURL and header
    axios.defaults.baseURL = '/api';
    
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchCurrentUser();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            // If unauthorized, clear token
            logoutAction();
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier: string, password: string): Promise<User> => {
        try {
            const response = await axios.post('/login', { identifier, password });
            const { access_token, user: loggedUser } = response.data;
            
            localStorage.setItem('ojk_asset_token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            setToken(access_token);
            setUser(loggedUser);
            return loggedUser;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login gagal. Periksa koneksi Anda.';
            throw new Error(message);
        }
    };

    const logoutAction = () => {
        localStorage.removeItem('ojk_asset_token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    const logout = async (): Promise<void> => {
        try {
            await axios.post('/logout');
        } catch (error) {
            console.error('Logout error on server', error);
        } finally {
            logoutAction();
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const response = await axios.get('/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
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
