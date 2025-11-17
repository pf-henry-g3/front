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
                setUser(null);
                setLoading(false);
                return null;
            }

            // Si hay token pero no usuario, verificar con el backend
            console.log('🔐 checkAuth - Verificando token con backend...');
            const response = await apiClient.get('/auth/me');

            const userData = response.data.data?.user || response.data.user;
            console.log('✅ checkAuth - Usuario verificado por backend:', userData.userName);
            
            // Guardar usuario en cookies
            saveToCookies(cookieToken, userData);
            setUser(userData);
            
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
            return null;
        } finally {
            setLoading(false);
            console.log('🏁 checkAuth - Completado');
        }
    };

    useEffect(() => {
        console.log('🚀 AuthProvider montado');
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