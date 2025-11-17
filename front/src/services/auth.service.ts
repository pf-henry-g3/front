import { apiClient } from "../lib/api-client";

export const authService = {
    // Login tradicional (email/password)
    signin: async (credentials: { email: string; password: string }) => {
        try {
            console.log('📤 auth.service - Iniciando login tradicional...');
            
            const response = await apiClient.post('/auth/signin', credentials);

            // Guardar token si el backend lo devuelve
            if (response.data?.data?.access_token) {
<<<<<<< HEAD
                const token = response.data.data.access_token;
                localStorage.setItem('access_token', token);
                console.log('💾 auth.service - Token guardado en localStorage');
=======
                localStorage.setItem('access_token', response.data.data.access_token);
                console.log('🔑 Token guardado en localStorage:', response.data.data.access_token.substring(0, 20) + '...');
            } else {
                console.error('❌ ERROR: No se recibió access_token en la respuesta');
                console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
            }

            if (response.data?.data?.tranformedUser) {
                localStorage.setItem('user', JSON.stringify(response.data.data.tranformedUser));
<<<<<<< HEAD
                console.log('👤 auth.service - Usuario guardado en localStorage');
=======
                console.log('👤 Usuario guardado en localStorage');
            } else {
                console.warn('⚠️ No se recibió tranformedUser en la respuesta');
            }

            // Verificar que se guardó correctamente
            const savedToken = localStorage.getItem('access_token');
            if (!savedToken) {
                console.error('❌ ERROR CRÍTICO: El token no se guardó en localStorage');
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
            }

            console.log('✅ auth.service - Login tradicional exitoso');
            return response;

        } catch (error: any) {
<<<<<<< HEAD
            console.error('❌ auth.service - Error en login tradicional:', error.message);
=======
            // Mejorar el mensaje de error para Network Errors
            if (error.message?.includes('conexión') || error.message?.includes('Network Error')) {
                const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'no configurada';
                console.error('❌ Error de conexión en signin:', error.message);
                throw new Error(`No se pudo conectar al servidor. Verifica que el backend esté corriendo en ${baseURL}`);
            }
            console.error('❌ Error en signin:', error.message);
>>>>>>> bab878ea921e7de09f46d05cefe60b1637cc272e
            throw error;
        }
    },

    // Sincronizar usuario de Auth0 con backend
    syncAuth0User: async (auth0Token: string, auth0User: any) => {
        try {
            console.log('📤 auth.service - Sincronizando usuario de Auth0...');

            const response = await apiClient.post('/auth/auth0/callback', {
                token: auth0Token,
                user: auth0User
            });

            console.log('✅ auth.service - Sincronización exitosa:', response.data);

            // Guardar el token que devuelve el BACKEND
            if (response.data?.data?.access_token) {
                const backendToken = response.data.data.access_token;
                localStorage.setItem('access_token', backendToken);
                console.log('💾 auth.service - Token del backend guardado:', backendToken.substring(0, 20) + '...');
            } else {
                console.log('⚠️ auth.service - Backend no devolvió token, usando token de Auth0');
                localStorage.setItem('access_token', auth0Token);
            }

            if (response.data?.data?.tranformedUser) {
                localStorage.setItem('user', JSON.stringify(response.data.data.tranformedUser));
                console.log('👤 auth.service - Información de usuario guardada');
            }

            return response;

        } catch (error: any) {
            console.error('❌ auth.service - Error en sincronización Auth0:', error.message);
            throw error;
        }
    },

    // Login con Google
    loginWithGoogle: async (loginWithRedirect: any) => {
        console.log('🔐 auth.service - Redirigiendo a Auth0 para login con Google...');
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
            console.log('🚪 auth.service - Ejecutando logout...');
            await apiClient.post('/auth/logout');
            console.log('✅ auth.service - Logout en backend exitoso');
        } catch (error: any) {
            console.error('❌ auth.service - Error en logout:', error.message);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                console.log('🗑️ auth.service - localStorage limpiado');
            }
        }
    }
};