'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Auth0CallbackPage() {
    const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const syncUserWithBackend = async () => {
            if (isLoading) return;

            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            try {
                // Obtener token de Auth0 con audience correcto
                const auth0Token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
                        scope: 'openid profile email',
                    },
                });

                const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
                const response = await fetch(`${base}/auth/auth0/callback`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${auth0Token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user })
                });
                console.log(response);


                if (!response.ok) {
                    const body = await response.text().catch(() => '');
                    throw new Error(`Error sincronizando usuario (${response.status}): ${body}`);
                }

                const data = await response.json();

                console.log(data);


                // Guardar tu JWT local en localStorage
                localStorage.setItem('access_token', data.data.access_token);
                localStorage.setItem('user', JSON.stringify(data.data.userWithoutPassword));

                router.push('/');

            } catch (err: any) {
                console.error('Error en callback:', err);
                setError(err.message);
            }
        };

        syncUserWithBackend();
    }, [isAuthenticated, isLoading, getAccessTokenSilently, router]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Error</h1>
                    <p>{error}</p>
                    <button onClick={() => router.push('/login')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                        Volver al login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4">Sincronizando tu cuenta...</p>
            </div>
        </div>
    );
}
