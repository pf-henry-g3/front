// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { AxiosError } from 'axios';
import IUser from '../interfaces/IUser';
import AuthContextType from "../interfaces/IAuthContextType"

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 🔄 Función para verificar autenticación con el backend
    const checkAuth = async () => {
        try {
            const response = await apiClient.get('/auth/me');
            console.log('response es 🎄: ', response);

            const userData = response.data.data.user;

            setUser(userData);

            // Sync con localStorage (opcional, solo como backup)
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(userData));
            }

            return userData;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log('❌ No autenticado:', error.response?.data?.message);
            }

            setUser(null);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
            }

            return null;
        } finally {
            setLoading(false);
        }
    };

    // 🚀 Verificar auth al montar el componente
    useEffect(() => {
        checkAuth();
    }, []);

    // ✅ Login: actualiza el estado globalmente
    const login = (userData: IUser) => {
        setUser(userData);
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    // 🚪 Logout: limpia todo
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
            console.log('✅ Logout exitoso');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
        } finally {
            setUser(null);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
            }

            router.push('/login');
        }
    };

    // 🔄 Refresh manual del usuario (útil después de actualizar perfil)
    const refreshUser = async () => {
        await checkAuth();
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 🎣 Hook personalizado para usar el contexto
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }

    return context;
}