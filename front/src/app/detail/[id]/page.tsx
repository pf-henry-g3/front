"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react"; // ✅ Importar useAuth0
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
}

export default function DetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getAccessTokenSilently, isAuthenticated } = useAuth0(); // ✅ Hook de Auth0
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
                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

                // ✅ Intentar obtener token de AMBAS fuentes
                let token = localStorage.getItem('access_token');
                
                // Si no hay token en localStorage, intentar obtenerlo de Auth0
                if (!token && isAuthenticated) {
                    try {
                        token = await getAccessTokenSilently();
                        console.log('🔑 Token obtenido de Auth0');
                    } catch (e) {
                        console.warn('⚠️ No se pudo obtener token de Auth0:', e);
                    }
                }

                console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');
                
                // ✅ Crear headers con el token
                const headers: any = {
                    'Content-Type': 'application/json'
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                // Mapeo de tipo a endpoint
                const endpoints = {
                    band: `${apiBase}/band/${params.id}`,
                    user: `${apiBase}/user/${params.id}`,
                    vacancy: `${apiBase}/vacancy/${params.id}`
                };

                console.log('📡 Petición a:', endpoints[type]);

                // ✅ Petición con headers
                const response = await axios.get(endpoints[type], { headers });
                const data = response.data?.data || response.data;

                // Mapeo de datos
                setItem({
                    id: data.id?.toString(),
                    name: data.bandName || data.userName || data.name,
                    type: type,
                    description: data.bandDescription || data.aboutMe || data.vacancyDescription || data.description,
                    imageUrl: data.urlImage,
                    formationYear: data.formationDate ? new Date(data.formationDate).getFullYear() : undefined,
                    city: data.city,
                    country: data.country,
                    isOpen: data.isOpen
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
            <div className="min-h-screen bg-azul flex items-center justify-center">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto mb-4"></div>
                    <p className="text-oscuro1 font-semibold text-lg">⏳ Cargando detalles...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-azul flex items-center justify-center px-4">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md">
                    <h2 className="text-red-700 text-xl font-bold mb-2">❌ Error</h2>
                    <p className="text-oscuro2 mb-6 font-medium">{error || "No se encontró el elemento"}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-oscuro1 font-bold rounded-xl border-2 border-oscuro1/20 hover:border-oscuro1/40 transition-all duration-300 shadow-lg transform hover:scale-105"
                        >
                            ← Volver
                        </button>
                        {error?.includes("iniciar sesión") && (
                            <button
                                onClick={() => router.push('/login')}
                                className="px-6 py-3 bg-gradient-to-r from-tur2 to-tur1 text-azul font-bold rounded-xl hover:from-tur1 hover:to-tur2 transition-all duration-300 shadow-lg transform hover:scale-105"
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
        <div className="min-h-screen bg-azul py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="mb-6 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition duration-300 flex items-center gap-2 font-medium backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-x-1"
                >
                    <span className="text-xl">←</span>
                    Volver
                </button>

                <DetailView selectedItem={item} />
            </div>
        </div>
    );
}