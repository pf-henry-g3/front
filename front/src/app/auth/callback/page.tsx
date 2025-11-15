// app/auth/callback/page.tsx
'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth.service';
import { cookieManager } from '@/src/utils/cookies';


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
                console.log('⏳ Auth0 cargando...');
                return;
            }

            if (!isAuthenticated) {
                console.log('❌ No autenticado con Auth0');
                router.push('/login');
                return;
            }

            if (!auth0User) {
                console.log('❌ No hay usuario de Auth0');
                setError('No se pudo obtener el usuario de Auth0');
                return;
            }

            try {
                setSyncStatus('Obteniendo token de Auth0...');
                console.log('🔑 Obteniendo token de Auth0...');

                const auth0Token = await getAccessTokenSilently();
                console.log('✅ Token de Auth0 obtenido');

                setSyncStatus('Sincronizando con el backend...');
                console.log('📤 Enviando al backend:', {
                    
                });

                const response = await authService.syncAuth0User(auth0Token, auth0User);

               
                console.log('📦 Respuesta completa:', response);
                

                const transformedUser = response.data.data.tranformedUser
                   

                console.log('👤 Usuario a guardar en contexto:', transformedUser);
                
                if (transformedUser) {
                login(transformedUser);
                console.log('✅ Usuario sincronizado y guardado en contexto');
            } else {
                    console.error('❌ NO hay usuario para guardar en el contexto');
                    throw new Error('No se recibió el usuario del backend');
                }

                setSyncStatus('¡Listo! Redirigiendo...');

               

                setTimeout(() => {
                    router.push('/dashboard');
                }, 500);

            } catch (err: any) {
                console.error('❌ Error en callback:', err);

                if (err instanceof AxiosError) {
                    console.error('📍 Detalles del error:', {
                        status: err.response?.status,
                        message: err.response?.data?.message,
                        data: err.response?.data
                    });
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError(err.message || 'Error desconocido');
                }
                //  IMPORTANTE: Limpiar cookies en caso de error
                cookieManager.clearAuth();
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