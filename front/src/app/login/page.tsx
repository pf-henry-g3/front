'use client';

import { useAuth0 } from '@auth0/auth0-react';
import LoginForm from "@/src/components/LoginForm";


export default function LoginPage() {
    const { loginWithRedirect } = useAuth0();

    const handleAuth0Login = () => {
        loginWithRedirect({
            appState: { returnTo: '/' }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black-50">
            <div className="w-full max-w-md p-9 space-y-6">
                {/* Tu formulario local */}
                <LoginForm />

                {/* Divisor */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">O continúa con</span>
                    </div>
                </div>

                {/* Botón Auth0 */}
                <button
                    onClick={handleAuth0Login}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#EB5424" />
                    </svg>
                    <span className="font-medium text-gray-700">Auth0</span>
                </button>
            </div>
        </div>
    );
}