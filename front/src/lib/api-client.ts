
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { cookieManager } from '../utils/cookies';

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,  // 👈 Envía cookies automáticamente
    headers: {
        'Content-Type': 'application/json',
    },
});


// NUEVO: Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
    (config) => {
        const token = cookieManager.getAccessToken();
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta para manejar errores
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        
        // ✅ Si el token expiró (401), limpiar cookies
        if (error.response?.status === 401) {
            console.warn('⚠️ Token expirado o inválido');
            cookieManager.clearAuth();
            
            // Disparar evento para actualizar el contexto
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('auth-changed'));
            }
        }
        
        console.error('❌ Error en la petición:', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);
// Cliente con token explícito (para Auth0)
export const apiClientWithToken = (token: string) => {
    return axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Token de Auth0
        },
    });
};

  