"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useMemo } from "react";

export default function AuthButtons() {
    const router = useRouter();
    const { user, loading, logout, isAuthenticated } = useAuth();

    const isAdmin = useMemo(() => {
        return user?.roles?.some(r => r.name === "Admin" || r.name === "SuperAdmin") ?? false;
    }, [user]);

    const handleLogout = async () => {
        await logout();
    };

    // Mostrar nada mientras carga
    if (loading) {
        return (
            <div className="flex items-center space-x-4">
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            {!isAuthenticated && (
                <>
                    <button
                        className="bg-tur1 py-1.5 px-4 rounded-md text-azul text-lg font-sans shadow-xl transition duration-300 hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2"
                        onClick={() => router.push("/login")}
                    >
                        Iniciar Sesión
                    </button>

                    <button
                        className="py-1.5 rounded-md px-4 text-tur3 text-lg font-sans border border-fondo1 transition duration-400 hover:bg-tur3 hover:border-verde hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2"
                        onClick={() => router.push("/register")}
                    >
                        Registrarse
                    </button>
                </>
            )}

            {isAuthenticated && (
                <>
                    <button
                        className="py-1.5 rounded-md px-4 text-tur3 text-lg font-sans border border-fondo1 transition duration-400 hover:bg-tur3 hover:border-verde hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer"
                        onClick={() => router.push("/dashboard/profile")}
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
    );
}