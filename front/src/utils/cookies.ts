'use client'

import Cookies from 'js-cookie';

// Configuración de cookies
const COOKIE_OPTIONS = {
    expires: 7, // 7 días
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: 'strict' as const,
    path: '/',
};

export const cookieManager = {
    // Guardar token de acceso
    setAccessToken: (token: string) => {
        Cookies.set('access_token', token, COOKIE_OPTIONS);
    },

    // Obtener token de acceso
    getAccessToken: (): string | undefined => {
        return Cookies.get('access_token');
    },

    // Guardar datos de usuario
    setUser: (user: any) => {
        Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);
    },

    // Obtener datos de usuario
    getUser: (): any | null => {
        const userStr = Cookies.get('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    },

    // Eliminar todas las cookies de autenticación
    clearAuth: () => {
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('user', { path: '/' });
    },

    // Verificar si está autenticado
    isAuthenticated: (): boolean => {
        return !!Cookies.get('access_token');
    },

    // Guardar preferencias adicionales
    setPreference: (key: string, value: string) => {
        Cookies.set(`pref_${key}`, value, { ...COOKIE_OPTIONS, expires: 365 });
    },

    // Obtener preferencias
    getPreference: (key: string): string | undefined => {
        return Cookies.get(`pref_${key}`);
    },
};