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
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // ✅ Función para obtener token de COOKIES (fuente principal)
    const getTokenFromCookies = () => {
        if (typeof window !== 'undefined') {
            try {
                const cookies = document.cookie.split(';');
                const tokenCookie = cookies.find(cookie => 
                    cookie.trim().startsWith('access_token=')
                );
                if (tokenCookie) {
                    const tokenValue = decodeURIComponent(tokenCookie.split('=')[1].trim());
                    console.log('🍪 Token obtenido de cookies:', tokenValue.substring(0, 20) + '...');
                    return tokenValue;
                }
            } catch (error) {
                console.error('❌ Error obteniendo token de cookies:', error);
            }
        }
        return null;
    };

    // ✅ Función para obtener usuario de COOKIES
    const getUserFromCookies = () => {
        if (typeof window !== 'undefined') {
            try {
                const cookies = document.cookie.split(';');
                const userCookie = cookies.find(cookie => 
                    cookie.trim().startsWith('user=')
                );
                if (userCookie) {
                    const userValue = decodeURIComponent(userCookie.split('=')[1].trim());
                    return JSON.parse(userValue);
                }
            } catch (error) {
                console.error('❌ Error obteniendo usuario de cookies:', error);
            }
        }
        return null;
    };

    // ✅ Función para guardar en COOKIES
    const saveToCookies = (authToken: string, userData: IUser) => {
        if (typeof window !== 'undefined') {
            try {
                // Guardar token
                document.cookie = `access_token=${encodeURIComponent(authToken)}; path=/; max-age=86400; SameSite=Lax`;
                // Guardar usuario
                document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax`;
                console.log('💾 Datos guardados en cookies');
            } catch (error) {
                console.error('❌ Error guardando en cookies:', error);
            }
        }
    };

    const checkAuth = async () => {
        try {
<<<<<<< HEAD
            console.log('🔄 checkAuth - Verificando autenticación...');
            
            // ✅ PRIMERO buscar en COOKIES
            const cookieToken = getTokenFromCookies();
            const cookieUser = getUserFromCookies();
            
            console.log('🔍 checkAuth - Token en cookies:', cookieToken ? cookieToken.substring(0, 20) + '...' : 'null');
            console.log('🔍 checkAuth - Usuario en cookies:', cookieUser ? cookieUser.userName : 'null');
            
            // Si hay token en cookies, establecerlo inmediatamente
            setToken(cookieToken);
            
            if (cookieToken && cookieUser) {
                console.log('✅ checkAuth - Usuario encontrado en cookies:', cookieUser.userName);
                setUser(cookieUser);
                return cookieUser;
            }
            
            if (!cookieToken) {
                console.log('❌ checkAuth - No hay token en cookies');
=======
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
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
                setUser(null);
                setLoading(false);
                return null;
            }

<<<<<<< HEAD
            // Si hay token pero no usuario, verificar con el backend
            console.log('🔐 checkAuth - Verificando token con backend...');
            const response = await apiClient.get('/auth/me');
=======
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
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e

            const userData = response.data.data?.user || response.data.user;
            console.log('✅ checkAuth - Usuario verificado por backend:', userData.userName);
            
            // Guardar usuario en cookies
            saveToCookies(cookieToken, userData);
            setUser(userData);
            
<<<<<<< HEAD
            return userData;
        
        } catch (error) {
            console.error('❌ checkAuth - Error:', error);
            if (error instanceof AxiosError && error.response?.status === 401) {
                console.log('🔐 Token inválido, limpiando cookies...');
                // Limpiar cookies
                document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
            setUser(null);
            setToken(null);
=======
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
            
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
            return null;
        } finally {
            setLoading(false);
            console.log('🏁 checkAuth - Completado');
        }
    };

    useEffect(() => {
<<<<<<< HEAD
        console.log('🚀 AuthProvider montado');
=======
        console.log('🔄 AuthContext: Verificando autenticación al montar...');
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        console.log('🔑 Token en localStorage:', token ? 'Sí existe' : 'No existe');
        console.log('👤 Usuario en localStorage:', userStr ? 'Sí existe' : 'No existe');
        
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
        checkAuth();
    }, []);

    const login = (userData: IUser, authToken: string) => {
        console.log('🔐 login llamado - user:', userData.userName, 'token:', authToken.substring(0, 20) + '...');
        
        // ✅ Guardar en COOKIES (fuente principal)
        saveToCookies(authToken, userData);
        
        // También en localStorage para compatibilidad
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setToken(authToken);
        setUser(userData);
        
        console.log('✅ login - Proceso completado');
        window.dispatchEvent(new Event('auth-changed'));
    };

    const logout = async () => {
        try {
            console.log('🚪 logout - Iniciando...');
            await apiClient.post('/auth/logout');
            console.log('✅ logout - Backend exitoso');
        } catch (error) {
            console.error('❌ logout - Error en backend:', error);
        } finally {
            // Limpiar COOKIES
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Limpiar localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
            
            setToken(null);
            setUser(null);
            
            console.log('✅ logout - Cookies y estado limpiados');
            router.push('/login');
        }
    };

    const refreshUser = async () => {
        console.log('🔄 refreshUser llamado');
        await checkAuth();
    };

    const isAuthenticated = !!user && !!token;

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
    };

    console.log("🔍 AuthContext value:", { 
        user: user?.userName, 
        token: token ? `✅ (${token.length} chars)` : "❌ null",
        isAuthenticated 
    });

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}