// src/lib/api-client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // 👈 Envía cookies automáticamente
    headers: {
        'Content-Type': 'application/json',
    },
});

// opcional pero util
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        console.error('❌ Error en la petición:', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

// Helper para peticiones con token manual (Auth0)
export const apiClientWithToken = (token: string) => {
    return axios.create({
        baseURL: API_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Token de Auth0
        },
    });
};