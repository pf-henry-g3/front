import { apiClient, apiClientWithToken } from "../lib/api-client";


export const authService = {
    // Login tradicional (email/password)
    signin: async (credentials: { email: string; password: string }) => {
        try {
            const response = await apiClient.post('/auth/signin', credentials);

            // Guardar token y usuario en localStorage
            if (response.data?.data?.access_token) {
                localStorage.setItem('access_token', response.data.data.access_token);
                console.log('🔑 Token guardado en localStorage:', response.data.data.access_token.substring(0, 20) + '...');
            } else {
                console.error('❌ ERROR: No se recibió access_token en la respuesta');
                console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
            }

            if (response.data?.data?.tranformedUser) {
                localStorage.setItem('user', JSON.stringify(response.data.data.tranformedUser));
                console.log('👤 Usuario guardado en localStorage');
            } else {
                console.warn('⚠️ No se recibió tranformedUser en la respuesta');
            }

            // Verificar que se guardó correctamente
            const savedToken = localStorage.getItem('access_token');
            if (!savedToken) {
                console.error('❌ ERROR CRÍTICO: El token no se guardó en localStorage');
            }

            console.log('✅ Login exitoso');
            return response.data; // ✅ Retornar response.data completo

        } catch (error: any) {
            // Mejorar el mensaje de error para Network Errors
            if (error.message?.includes('conexión') || error.message?.includes('Network Error')) {
                const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'no configurada';
                console.error('❌ Error de conexión en signin:', error.message);
                throw new Error(`No se pudo conectar al servidor. Verifica que el backend esté corriendo en ${baseURL}`);
            }
            console.error('❌ Error en signin:', error.message);
            throw error;
        }
    },

    // Sincronizar usuario de Auth0 con backend
    syncAuth0User: async (auth0Token: string, auth0User: any) => {
        try {
            const client = apiClientWithToken(auth0Token);

            console.log('📤 Enviando al backend:', {
                token: `Bearer ${auth0Token}`,
                userData: auth0User
            });

            const response = await client.post('/auth/auth0/callback', {
                token: auth0Token,
                user: auth0User
            });

            console.log('✅ Respuesta del backend:', response.data);

            // ✅ Guardar token del BACKEND en localStorage
            if (response.data?.data?.access_token) {
                localStorage.setItem('access_token', response.data.data.access_token);
                console.log('🔑 Token guardado en localStorage');
            }

            if (response.data?.data?.tranformedUser) {
                localStorage.setItem('user', JSON.stringify(response.data.data.tranformedUser));
                console.log('👤 Usuario guardado en localStorage');
            }

            // ✅ Retornar el objeto completo response.data
            return response.data; // { success, message, data: { tranformedUser, login } }

        } catch (error: any) {
            console.error('❌ Error sincronizando con backend:', error.message);
            throw error;
        }
    },

    // Login con Google
    loginWithGoogle: async (loginWithRedirect: any) => {
        await loginWithRedirect({
            authorizationParams: {
                connection: 'google-oauth2',
                redirect_uri: `${window.location.origin}/auth/callback`,
            },
        });
    },

    // Logout
    logout: async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            if (token) {
                await apiClient.post('/auth/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        } catch (error: any) {
            console.error('❌ Error en logout:', error.message);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
    }
};