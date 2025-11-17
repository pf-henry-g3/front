// src/lib/api-client.ts
import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,  // ✅ IMPORTANTE: Envía cookies automáticamente
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            let token: string | null = null;
            
            try {
                const cookies = document.cookie.split(';');
                const tokenCookie = cookies.find(cookie => 
                    cookie.trim().startsWith('access_token=')
                );
                if (tokenCookie) {
                    token = decodeURIComponent(tokenCookie.split('=')[1].trim());
                }
            } catch (error) {
                console.error('❌ Error leyendo cookies:', error);
            }
            
            if (!token) {
                token = localStorage.getItem('access_token');
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔐 api-client - Token agregado:', token.substring(0, 20) + '...');
            } else {
                // ✅ No loguear warning para requests que no requieren auth
                const publicEndpoints = ['/auth/signin', '/auth/auth0/callback', '/auth/signup'];
                const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
                if (!isPublic) {
                    console.log('⚠️ api-client - No se encontró token para:', config.url);
                }
            }
        }

        return config;
    },
    (error) => {
        console.error('❌ Error en interceptor de request:', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<any>) => {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        
        if (error.response?.status === 401) {
            console.log('🔐 Token inválido, limpiando...');
            // Limpiar cookies y localStorage
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
        }
        
        console.error('❌ Error en la petición:', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);