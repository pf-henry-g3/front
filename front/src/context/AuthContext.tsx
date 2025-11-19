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
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

            if (!token) {
                console.log('⚠️ No hay token almacenado');
                // Si no hay token pero hay usuario en localStorage, limpiarlo
                if (userStr) {
                    console.log('🧹 Limpiando usuario obsoleto de localStorage');
                    localStorage.removeItem('user');
                }
                setUser(null);
                setLoading(false);
                return null;
            }

            // Si hay token pero no hay usuario, intentar cargar desde localStorage primero
            if (token && userStr) {
                try {
                    const localUser = JSON.parse(userStr);
                    console.log('👤 Usuario encontrado en localStorage, usando temporalmente');
                    setUser(localUser);
                    // Continuar verificando con el backend para actualizar
                } catch (e) {
                    console.warn('⚠️ Error parseando usuario de localStorage:', e);
                }
            }

            // Solo llamar al backend si HAY token
            const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';
            if (!baseURL) {
                console.error('❌ URL del backend no configurada');
                setUser(null);
                setLoading(false);
                return null;
            }

            console.log('🔍 Verificando token con backend...', baseURL);
            const response = await apiClient.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('✅ Usuario verificado:', response.data);

            const userData = response.data.data?.user || response.data.user;
            setUser(userData);

            // Actualizar localStorage con los datos más recientes del backend (incluyendo roles actualizados)
            if (typeof window !== 'undefined' && userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }

            return userData;

        } catch (error) {
            if (error instanceof AxiosError) {
                const errorMessage = error.response?.data?.message || error.message;

                // Solo limpiar localStorage si es un 401 (token inválido/expirado)
                if (error.response?.status === 401) {
                    console.log('ℹ️ Token inválido o expirado - limpiando sesión');

                    // Limpiar localStorage solo si el token es realmente inválido
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                    }
                    setUser(null);
                } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
                    // Error de red - NO limpiar localStorage, mantener el usuario si existe en localStorage
                    console.warn('⚠️ Error de conexión al verificar auth. Manteniendo sesión local.');

                    // Intentar cargar usuario desde localStorage si existe
                    if (typeof window !== 'undefined') {
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                            try {
                                const localUser = JSON.parse(userStr);
                                setUser(localUser);
                                return localUser;
                            } catch (e) {
                                // ignore
                            }
                        }
                    }
                    setUser(null);
                } else {
                    console.error('❌ Error verificando auth:', errorMessage);
                    // Otros errores - mantener sesión local si existe
                    if (typeof window !== 'undefined') {
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                            try {
                                const localUser = JSON.parse(userStr);
                                setUser(localUser);
                                return localUser;
                            } catch (e) {
                                // ignore
                            }
                        }
                    }
                    setUser(null);
                }
            } else {
                console.error('❌ Error desconocido verificando auth:', error);
                // Mantener sesión local si existe
                if (typeof window !== 'undefined') {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        try {
                            const localUser = JSON.parse(userStr);
                            setUser(localUser);
                            return localUser;
                        } catch (e) {
                            // ignore
                        }
                    }
                }
                setUser(null);
            }
            return null;

        } finally {
            // Aseguramos que el estado de carga se desactive siempre,
            // incluso si hubo errores en la verificación.
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('🔄 AuthContext: Verificando autenticación al montar...');
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        console.log('🔑 Token en localStorage:', token ? 'Sí existe' : 'No existe');
        console.log('👤 Usuario en localStorage:', userStr ? 'Sí existe' : 'No existe');

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