// services/auth.service.ts
import { apiClient, apiClientWithToken } from "../lib/api-client";
import { LoginData } from "../interfaces/ILoginData";
import { CreateUserDto } from "../interfaces/ICreateUserDto";

interface LoginWithRedirectFn {
    (options: any): Promise<void>;
}

export const authService = {
    async signin(credentials: LoginData) {
        const response = await apiClient.post('/auth/signin', credentials);
        return response.data;
    },

    async signup(data: CreateUserDto) {
        const response = await apiClient.post('/auth/signup', data);
        return response.data;
    },


    async loginWithGoogle(loginWithRedirect: LoginWithRedirectFn) {
        return loginWithRedirect({
            authorizationParams: {
                connection: "google-oauth2",
                redirect_uri:
                    typeof window !== "undefined"
                        ? `${window.location.origin}/auth/callback`
                        : undefined,
            },
        });
    },


    async syncAuth0User(auth0Token: string, userData: any) {
        const client = apiClientWithToken(auth0Token);
        const response = await client.post('/auth/auth0/callback', { user: userData });
        return response.data;
    },

    async getMe() {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    async logout() {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },
};