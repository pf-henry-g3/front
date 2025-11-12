"use client";

import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

export default function AuthButtons () {
    const router = useRouter();
    const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
    const [hasBackendToken, setHasBackendToken] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
            setHasBackendToken(Boolean(token));
            if (token) {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const roles: string[] = Array.isArray(payload?.roles) ? payload.roles : [];
                setIsAdmin(roles.includes("Admin") || roles.includes("SuperAdmin"));
            } else {
                setIsAdmin(false);
            }
        } catch {
            setIsAdmin(false);
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="flex items-center space-x-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-tur1" />
            </div>
        );
    }

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
        }
        const siteUrl =
            (process.env.NEXT_PUBLIC_SITE_URL ||
                (typeof window !== "undefined" ? window.location.origin : ""))
                .replace(/\/+$/, ""); // sin barra final

        logout({ logoutParams: { returnTo: siteUrl, client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID } });
    };

    const loggedIn = isAuthenticated || hasBackendToken;

    return (
        <div className='flex items-center space-x-4'>
            {!loggedIn && (
                <>
                    <button 
                        className="bg-tur1 py-1.5 px-4 rounded-md text-azul text-lg font-sans shadow-xl transition duration-300 hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2" 
                        onClick={() => {
                            router.push("/login");
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Iniciar Sesión
                    </button>

                    <button 
                        className="py-1.5 rounded-md px-4 text-tur3 text-lg font-sans border border-fondo1 transition duration-400 hover:bg-tur3 hover:border-verde hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2" 
                        onClick={() => {router.push("/register");}}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Registrarse
                    </button>
                </>
            )}

            {loggedIn && (
                <>
                    <button
                        className="py-1.5 rounded-md px-4 text-tur3 text-lg font-sans border border-fondo1 transition duration-400 hover:bg-tur3 hover:border-verde hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer"
                        onClick={() => router.push("/dashboard")}
                    >
                        Mi perfil
                    </button>

                    {isAdmin && (
                        <button
                            className="py-1.5 rounded-md px-4 text-purple-400 text-lg font-sans border border-fondo1 transition duration-400 hover:bg-purple-400 hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer"
                            onClick={() => router.push("/dashboard/admin")}
                        >
                            Admin
                        </button>
                    )}

                    <button 
                        className="bg-red-500 py-1.5 px-4 rounded-md text-white text-lg font-sans shadow transition duration-300 hover:bg-red-600 hover:-translate-y-0.5 hover:cursor-pointer"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </>
            )}
        </div>
    )
}