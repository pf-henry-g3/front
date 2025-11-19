"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import DetailView from "@/src/components/DetailView";

interface DetailItem {
    id: string;
    name: string;
    type: "band" | "user" | "vacancy";
    description?: string;
    imageUrl?: string;
    formationYear?: number;
    city?: string;
    country?: string;
    isOpen?: boolean;
    averageRating?: number;
}

export default function DetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [item, setItem] = useState<DetailItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const type = searchParams.get('type') as "band" | "user" | "vacancy" | null;

    useEffect(() => {
        const loadDetail = async () => {
            if (!params.id || !type) {
                setError("ID o tipo no especificado");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '');

                let token = localStorage.getItem('access_token');

                if (!token && isAuthenticated) {
                    try {
                        token = await getAccessTokenSilently();
                        console.log('🔑 Token obtenido de Auth0');
                    } catch (e) {
                        console.warn('⚠️ No se pudo obtener token de Auth0:', e);
                    }
                }

                console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');

                const headers: any = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const endpoints = {
                    band: `${apiBase}/band/${params.id}`,
                    user: `${apiBase}/user/${params.id}`,
                    vacancy: `${apiBase}/vacancy/${params.id}`
                };

                console.log('📡 Petición a:', endpoints[type]);

                const response = await axios.get(endpoints[type], { headers });
                const data = response.data?.data || response.data;

                setItem({
                    id: data.id?.toString(),
                    name: data.bandName || data.userName || data.name,
                    type: type,
                    description: data.bandDescription || data.aboutMe || data.vacancyDescription || data.description,
                    imageUrl: data.urlImage,
                    formationYear: data.formationDate ? new Date(data.formationDate).getFullYear() : undefined,
                    city: data.city,
                    country: data.country,
                    isOpen: data.isOpen,
                    averageRating: data.averageRating
                });

                console.log('✅ Datos cargados exitosamente');

            } catch (error: any) {
                console.error('❌ Error:', error);
                console.error('❌ Status:', error.response?.status);
                console.error('❌ Data:', error.response?.data);

                if (error.response?.status === 401) {
                    setError("Debes iniciar sesión para ver esta información");
                    setTimeout(() => router.push('/login'), 2000);
                } else if (error.response?.status === 404) {
                    setError("El elemento no existe");
                } else {
                    setError("No se pudo cargar la información");
                }
            } finally {
                setLoading(false);
            }
        };

        loadDetail();
    }, [params.id, type, router, isAuthenticated, getAccessTokenSilently]);

    if (loading) {
        return (
            <div className="min-h-screen mt-12 bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto mb-4"></div>
                    <p className="text-txt1 font-semibold text-lg">🎵 Cargando detalles...</p>
                    <p className="text-txt2 text-sm mt-2">Obteniendo información...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen mt-12 bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center px-4">
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-txt1 text-xl font-bold mb-2">Error</h2>
                    <p className="text-txt2 mb-6 font-medium">{error || "No se encontró el elemento"}</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-txt1 font-bold rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
                        >
                            ← Volver
                        </button>
                        {error?.includes("iniciar sesión") && (
                            <button
                                onClick={() => router.push('/login')}
                                className="px-6 py-3 bg-gradient-to-r from-tur2 to-tur1 text-azul font-bold rounded-xl hover:from-tur1 hover:to-tur2 transition-all duration-300"
                            >
                                Iniciar Sesión
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 mt-12 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                {/* Header con botón de volver */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="group px-6 py-3 bg-white/10 hover:bg-white/20 text-txt1 rounded-xl transition-all duration-300 flex items-center gap-3 font-semibold backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        Volver atrás
                    </button>
                </div>

                {/* Contenedor principal con mismos estilos que formularios */}
                <div>
                    <DetailView selectedItem={item} />
                </div>
            </div>
        </div>
    );
}