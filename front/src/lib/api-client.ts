// src/lib/api-client.ts
import axios, { AxiosError } from 'axios';

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
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos de timeout
});

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
