'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth.service';

export default function Auth0CallbackPage() {
    const {
        user: auth0User,
        getAccessTokenSilently,
        isAuthenticated,
        isLoading
    } = useAuth0();

    const { login } = useAuth();
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<string>('Conectando con Auth0...');

    useEffect(() => {
        const syncUserWithBackend = async () => {
            if (isLoading) {
                console.log('⏳ Auth0Callback - Auth0 aún cargando...');
                return;
            }

            if (!isAuthenticated) {
                console.log('❌ Auth0Callback - Usuario no autenticado en Auth0');
                router.push('/login');
                return;
            }

            if (!auth0User) {
                console.log('❌ Auth0Callback - No se pudo obtener usuario de Auth0');
                setError('No se pudo obtener la información del usuario');
                return;
            }

            try {
                setSyncStatus('Obteniendo token de Auth0...');
                console.log('🔑 Auth0Callback - Solicitando token de Auth0...');

                const auth0Token = await getAccessTokenSilently();
                console.log('✅ Auth0Callback - Token de Auth0 obtenido');

                setSyncStatus('Sincronizando con el backend...');
                console.log('📤 Auth0Callback - Enviando datos al backend...');

                // ✅ authService.syncAuth0User ahora guarda automáticamente en COOKIES
                const response = await authService.syncAuth0User(auth0Token, auth0User);

                console.log('✅ Auth0Callback - Usuario sincronizado:', response.data.data.tranformedUser);

                // ✅ IMPORTANTE: Obtener el token que authService guardó en las COOKIES
                const cookies = document.cookie.split(';');
                const tokenCookie = cookies.find(cookie => 
                    cookie.trim().startsWith('access_token=')
                );
                
                let finalToken = auth0Token; // fallback
                if (tokenCookie) {
                    finalToken = decodeURIComponent(tokenCookie.split('=')[1].trim());
                    console.log('✅ Auth0Callback - Token obtenido de COOKIES:', finalToken.substring(0, 20) + '...');
                } else if (response.data?.data?.access_token) {
                    finalToken = response.data.data.access_token;
                    console.log('✅ Auth0Callback - Token obtenido del backend');
                }

                // ✅ Llamar a login para actualizar el contexto de React
                login(response.data.data.tranformedUser, finalToken);

                setSyncStatus('¡Listo! Redirigiendo...');

                setTimeout(() => {
                    router.push('/dashboard');
                }, 500);

            } catch (err: any) {
                console.error('❌ Auth0Callback - Error en el proceso:', err);
                
                if (err instanceof AxiosError) {
                    console.error('📍 Detalles del error:', {
                        status: err.response?.status,
                        message: err.response?.data?.message
                    });
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError(err.message || 'Error desconocido durante la autenticación');
                }
            }
        };

        syncUserWithBackend();
    }, [isAuthenticated, isLoading, auth0User, getAccessTokenSilently, router, login]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-red-50 rounded-lg shadow-md max-w-md">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Autenticación</h1>
                    <p className="text-red-700 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Volver al login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-6 text-lg text-gray-700 font-medium">{syncStatus}</p>
                <p className="mt-2 text-sm text-gray-500">Por favor espera un momento</p>
            </div>
        </div>
    );
}