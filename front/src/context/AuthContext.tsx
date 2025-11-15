// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { AxiosError } from 'axios';
import IUser from '../interfaces/IUser';
import AuthContextType from "../interfaces/IAuthContextType"
import { cookieManager } from '../utils/cookies';



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    //  Función para verificar autenticación
    const checkAuth = async () => {
        try {
            const token = cookieManager.getAccessToken();
            
            if (!token) {
                console.log('⚠️ No hay token en cookies');
                setUser(null);
                setLoading(false);
                return null;
            }

            // Intentar obtener usuario de cookies primero (más rápido)
            const cachedUser = cookieManager.getUser();
            if (cachedUser) {
                setUser(cachedUser);
                setLoading(false);
                return cachedUser;
            }
           
            console.log('🔍 No hay usuario en cache, verificando con backend...');
            const response = await apiClient.get('/auth/me');
            console.log('✅ Usuario verificado con backend:', response.data);

            const userData = response.data.data.user;

            setUser(userData);
            cookieManager.setUser(userData); // Actualizar cache
         

            return userData;
        
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log('❌ error verificado auth:', error.response?.data?.message);
            }
            // Limpiar cookies si hay error de autenticación
            cookieManager.clearAuth();
            setUser(null);
            return null;
            
           
        } finally {
            setLoading(false);
        }
    };

    // 🚀 Verificar auth al montar el componente
    useEffect(() => {
        checkAuth();
        const handleAuthChange = () => {
            console.log('🔔 Evento auth-changed recibido');
            checkAuth();
        };

        window.addEventListener('auth-changed', handleAuthChange);
        return () => {
            window.removeEventListener('auth-changed', handleAuthChange);
        };
    }, []);

    // ✅ Login: actualiza el estado globalmente
    const login = (userData: IUser) => {
        console.log('🔐 Ejecutando login en contexto para:', userData.userName);
        setUser(userData);
        cookieManager.setUser(userData);
        
        console.log('✅ Usuario guardado en estado y cookies');
    };

    // 🚪 Logout: limpia todo
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
            console.log('✅ Logout exitoso');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
        } finally {
            cookieManager.clearAuth();
            setUser(null);
            console.log('✅ Cookies limpiadas y estado reseteado');
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
        isAuthenticated: !!user && !!cookieManager.getAccessToken(),
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