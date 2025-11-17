// src/lib/api-client.ts
import axios, { AxiosError } from 'axios';

<<<<<<< HEAD
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,  // ✅ IMPORTANTE: Envía cookies automáticamente
=======
// Obtener la URL base con fallback
const getBaseURL = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';
    if (!url) {
        console.warn('⚠️ NEXT_PUBLIC_API_URL o NEXT_PUBLIC_BACKEND_URL no está configurada');
        return '';
    }
    let cleanUrl = url.replace(/\/+$/, ''); // Remover trailing slashes
    
    // Asegurar que tenga protocolo
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `http://${cleanUrl}`;
    }
    
    console.log('🔗 Base URL configurada:', cleanUrl);
    return cleanUrl;
};

// Crear instancia de axios con configuración base
const baseURL = getBaseURL();
if (!baseURL) {
    console.error('⚠️ CRÍTICO: NEXT_PUBLIC_API_URL o NEXT_PUBLIC_BACKEND_URL no está configurada. Las peticiones al backend fallarán.');
}

export const apiClient = axios.create({
    baseURL: baseURL,
    withCredentials: true,  // 👈 Envía cookies automáticamente
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos de timeout
});

<<<<<<< HEAD
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
=======
// opcional pero util
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        const baseURL = getBaseURL();
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        const status = error.response?.status;
        
        // Detectar Network Error (backend no disponible o URL mal configurada)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            const helpfulMessage = !baseURL 
                ? 'Error de conexión: La URL del backend no está configurada. Verifica NEXT_PUBLIC_API_URL o NEXT_PUBLIC_BACKEND_URL en las variables de entorno.'
                : `Error de conexión: No se pudo conectar al backend en ${baseURL}. Verifica que el servidor esté corriendo.`;
            console.error('❌ Network Error:', helpfulMessage);
            return Promise.reject(new Error(helpfulMessage));
        }
        
        // No mostrar errores 401 como críticos (token inválido/expirado es normal cuando no hay sesión)
        if (status === 401) {
            // Solo loggear si no es una petición a /auth/me (que se maneja en AuthContext)
            if (!error.config?.url?.includes('/auth/me')) {
                console.log('ℹ️ Token inválido o expirado (esto es normal si no estás logueado)');
            }
        } else {
            console.error('❌ Error en la petición:', errorMessage);
        }
        
        return Promise.reject(new Error(errorMessage));
    }
);

export const apiClientWithToken = (token: string) => {
    return axios.create({
        baseURL: getBaseURL(),
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Token de Auth0
        },
    });
};
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
