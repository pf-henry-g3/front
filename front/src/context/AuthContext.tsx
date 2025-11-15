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
            // ✅ Verificar si hay token en localStorage primero
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            
            if (!token) {
                console.log('⚠️ No hay token almacenado');
                setUser(null);
                setLoading(false);
                return null;
            }

            // Solo llamar al backend si HAY token
            console.log('🔍 Verificando token con backend...');
            const response = await apiClient.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('✅ Usuario verificado:', response.data);

            const userData = response.data.data?.user || response.data.user;
            setUser(userData);

            return userData;
        
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('❌ Error verificando auth:', error.response?.data?.message);
                
                // Si el token es inválido, limpiar localStorage
                if (error.response?.status === 401) {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                    }
                }
            }
            
            setUser(null);
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
        console.log('🔐 Login en contexto:', userData.userName);
        setUser(userData);
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    // 🚪 Logout: limpia todo
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
            console.log('✅ Logout exitoso en backend');
        } catch (error) {
            console.error('❌ Error al cerrar sesión en backend:', error);
        } finally {
            // Limpiar localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
            
            setUser(null);
            console.log('✅ Estado y localStorage limpiados');
            router.push('/login');
        }
    };

    // 🔄 Refresh manual del usuario
    const refreshUser = async () => {
        console.log('🔄 Refrescando usuario...');
        await checkAuth();
    };
  
    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser, // ✅ Agregar aquí
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