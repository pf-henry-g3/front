// encapsula toda la lógica de autenticación del frontend para no tener
// que repetirla en cada página o componente.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { AxiosError } from 'axios';

interface User {
    id: string;
    email: string;
    name: string;
    userName: string;
    urlImage: string;
    roles: Array<{ name: string }>;
}

export function useAuth(redirectTo: string = '/login') {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // La cookie se envía automáticamente con withCredentials: true
                const response = await apiClient.get('/auth/me');
                setUser(response.data.user);
                console.log('✅ Usuario autenticado:', response.data.data.user);
            } catch (error) {
                if (error instanceof AxiosError) {
                    console.log('❌ No autenticado:', error.response?.data?.message);
                }
                router.push(redirectTo);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, redirectTo]);

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
            console.log('✅ Logout exitoso, cookie eliminada');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            // Redirigir igual al login
            router.push('/login');
        }
    };

    return { user, loading, logout };
}