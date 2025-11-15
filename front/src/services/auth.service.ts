// src/services/auth.service.ts
import { apiClient, apiClientWithToken } from "../lib/api-client";
import { cookieManager } from "../utils/cookies";


export const authService = {
    
    signin: async (credentials: { email: string; password: string }) => {
        try {
            const response = await apiClient.post('/auth/signin', credentials);

            // ✅ Guardar token y usuario en cookies automáticamente
            if (response.data?.data?.access_token) {
                cookieManager.setAccessToken(response.data.data.access_token);
            }

            if (response.data?.data?.tranformedUser) {
                cookieManager.setUser(response.data.data.tranformedUser);
            }

            console.log('✅ Login exitoso, cookies guardadas');
            return response.data;

        } catch (error: any) {
            console.error('❌ Error en signin:', error.message);
            throw error;
        }
    },
     
    // ✅ Registro de usuario
    signup: async (userData: any) => {
        try {
            const response = await apiClient.post('/auth/signup', userData);

            // Si el backend retorna token al registrarse
            if (response.data?.data?.access_token) {
                cookieManager.setAccessToken(response.data.data.access_token);
            }

            if (response.data?.data?.user) {
                cookieManager.setUser(response.data.data.user);
            }

            return response.data;

        } catch (error: any) {
            console.error('❌ Error en signup:', error.message);
            throw error;
        }
    },

    // ✅ Login con Google (Auth0)
    loginWithGoogle: async (loginWithRedirect: any) => {
        await loginWithRedirect({
            authorizationParams: {
                connection: 'google-oauth2',
                redirect_uri: `${window.location.origin}/auth/callback`,
            },
        });
    },

    //  Sincronizar usuario de Auth0 con backend
    syncAuth0User: async (auth0Token: string, auth0User: any) => {
        try {
            const client = apiClientWithToken(auth0Token);

            console.log('📤 Enviando datos al backend:', {
                user: auth0User});
            
            const response = await client.post('/auth/auth0/callback', {
                user: auth0User
            });
            console.log('📥 Respuesta completa del backend:', response.data);

            
           // ✅ Guardar token del BACKEND (NO el de Auth0)
            const backendToken = response.data?.data?.access_token || response.data?.access_token;
            const transformedUser = response.data?.data?.tranformedUser || response.data?.data?.user || response.data?.user;

            console.log('🔍 Token del backend:', backendToken); // ✅ Log agregado
            console.log('🔍 Usuario transformado:', transformedUser); // ✅ Log agregado

            if (backendToken) {
                cookieManager.setAccessToken(backendToken);
                console.log('✅ Token guardado en cookies');
            } else {
                console.error('❌ NO se recibió token del backend');
            }

            if (transformedUser) {
                cookieManager.setUser(transformedUser);
                console.log('✅ Usuario guardado en cookies');
            } else {
                console.error('❌ NO se recibió usuario transformado del backend');
            }

            return response;
            }

    

        catch (error: any) {
            console.error('❌ Error sincronizando con backend:', error.message);
            console.error('📍 Detalles del error:', error.response?.data);
            throw error;
        }
    },
  
    verifyToken: async () => {
        const token = cookieManager.getAccessToken();
        
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const client = apiClientWithToken(token);
        return await client.get('/auth/me');
    },

    // ✅ Logout
    logout: async () => {
        const token = cookieManager.getAccessToken();
        
        if (token) {
            const client = apiClientWithToken(token);
            await client.post('/auth/logout').catch(() => {
                // Ignorar errores del backend
            });
        }

        cookieManager.clearAuth();
        console.log('✅ Cookies limpiadas');
    }

};