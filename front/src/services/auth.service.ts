// services/auth.service.ts
import { apiClient, apiClientWithToken } from "../lib/api-client";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    name: string;
    email: string;
    userName: string;
    password: string;
    confirmPassword: string;
}

export const authService = {
    async signin(credentials: LoginCredentials) {
        const response = await apiClient.post('/auth/signin', credentials);
        return response.data;
    },

    async signup(data: SignupData) {
        const response = await apiClient.post('/auth/signup', data);
        return response.data;
    },

    async syncAuth0User(auth0Token: string, userData: any) {
        const client = apiClientWithToken(auth0Token);
        const response = await client.post('/auth/auth0/callback', { user: userData });
        return response.data;
    },

    // Verificar autenticación
    async getMe() {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    // Logout
    async logout() {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },
};