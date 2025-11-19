"use client"
import { config as dotenvConfig } from 'dotenv';
import { useEffect, useState, useCallback, useMemo } from "react";
import Filter from "../../components/Filter";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";

import axios from "axios";
import { useRouter } from 'next/navigation';



// Interfaz ProductCardProps (la misma que en Filter.tsx)
interface ProductCardProps {
    id: string;
    name: string;
    type: "band" | "user" | "vacancy";
    description?: string;
    imageUrl?: string;
    isSelected?: boolean;
    onClick?: () => void;
    // Propiedades opcionales para diferentes tipos
    formationYear?: number;  // Para bandas
    city?: string;          // Para usuarios y vacantes
    country?: string;       // Para usuarios y vacantes
    isOpen?: boolean;       // Para vacantes
}

export default function HomePage() {
    const router = useRouter();
    const [allItems, setAllItems] = useState<ProductCardProps[]>([]);
    const [filteredItems, setFilteredItems] = useState<ProductCardProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    // Estado para el elemento seleccionado
    //const [selectedItem, setSelectedItem] = useState<ProductCardProps | null>(null);

    const loadDataFromBackend = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');
            if (!apiBase) {
                setError('URL del backend no configurada');
                setLoading(false);
                return;
            }

            const [bandResponse, userResponse, vacancyResponse] = await Promise.all([
                axios.get(`${apiBase}/band`),
                axios.get(`${apiBase}/user`),
                axios.get(`${apiBase}/vacancy`)
            ]);

            // Extraer datos - algunos endpoints pueden devolver { success, data } otros directamente el array
            const rawBandsData = bandResponse.data?.data || bandResponse.data || [];
            const rawUsersData = userResponse.data?.data || userResponse.data || [];
            const rawVacanciesData = vacancyResponse.data?.data || vacancyResponse.data || [];

            const bands: ProductCardProps[] = Array.isArray(rawBandsData) ? rawBandsData.map((band: any) => {
                return {
                    id: band.id?.toString() || `band-${Math.random()}`,
                    name: band.bandName || band.name || "Banda sin nombre",
                    type: "band" as const,
                    description: band.bandDescription || band.description || "Sin descripción",
                    imageUrl: band.urlImage || "/default-band.jpg",
                    formationYear: band.formationDate ? new Date(band.formationDate).getFullYear() : undefined
                };
            }) : [];

            const users: ProductCardProps[] = Array.isArray(rawUsersData) ? rawUsersData.map((user: any) => {
                return {
                    id: user.id?.toString() || `user-${Math.random()}`,
                    name: user.userName || user.name || "Usuario sin nombre",
                    type: "user" as const,
                    description: user.aboutMe || user.description || "Sin descripción",
                    imageUrl: user.urlImage || "/default-user.jpg",
                    city: user.city,
                    country: user.country
                };
            }) : [];

            const vacancies: ProductCardProps[] = Array.isArray(rawVacanciesData) ? rawVacanciesData.map((vacancy: any) => {
                return {
                    id: vacancy.id?.toString() || `vacancy-${Math.random()}`,
                    name: vacancy.name || "Vacante sin título",
                    type: "vacancy" as const,
                    description: vacancy.vacancyDescription || vacancy.description || "Sin descripción",
                    imageUrl: vacancy.urlImage || "/default-vacancy.jpg",
                    city: vacancy.city,
                    country: vacancy.country,
                    isOpen: vacancy.isOpen !== false // Por defecto true si no se especifica
                };
            }) : [];

            const combinedData = [...bands, ...users, ...vacancies];

            setAllItems(combinedData);
            setFilteredItems(combinedData);

        } catch (err) {
            setError('Error al cargar los datos del servidor');
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar datos al montar el componente
    useEffect(() => {
        loadDataFromBackend();
    }, []);

    // Función para manejar los resultados del filtro
    const handleFilterResults = useCallback((results: ProductCardProps[]) => {
        setFilteredItems(results);
        setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
    }, []);

    // Cálculos de paginación
    const paginationData = useMemo(() => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        return {
            totalPages,
            paginatedItems,
            totalItems: filteredItems.length
        };
    }, [filteredItems, currentPage, itemsPerPage]);

    // Función para cambiar de página
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll suave hacia arriba al cambiar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Función para cambiar items por página
    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Resetear a la primera página
    }, []);

    // Función para manejar la selección de un elemento
    const handleItemClick = useCallback((item: ProductCardProps) => {
        router.push(`/detail/${item.id}?type=${item.type}`);
    }, [router]);


    // Mostrar loading
    if (loading) {
        return (
            <div className="min-h-screen py-8 px-4 flex justify-center items-center">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto mb-4"></div>
                    <p className="text-oscuro1 font-semibold text-lg">⏳ Cargando datos del servidor...</p>
                </div>
            </div>
        );
    }

    // Mostrar error
    if (error) {
        return (
            <div className="min-h-screen py-8 px-4 flex justify-center items-center">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md">
                    <h2 className="text-red-700 text-xl font-bold mb-2">❌ Error</h2>
                    <p className="text-oscuro2 mb-6 font-medium">{error}</p>
                    <button
                        onClick={loadDataFromBackend}
                        className="px-6 py-3 bg-linear-to-r from-tur2 to-tur1 text-azul font-bold rounded-xl hover:from-tur1 hover:to-tur2 transition-all duration-300 shadow-lg transform hover:scale-105"
                    >
                        🔄 Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            {/* ✅ LAYOUT SIMPLIFICADO: Una sola columna centrada */}
            <div className="max-w-4xl  mx-auto">
                <div className="text-center mb-8 pt-16">
                    <h1 className="text-white text-4xl font-bold mb-2 drop-shadow-lg">
                        Bienvenidos!
                    </h1>
                    <p className="text-white/90 text-lg font-medium drop-shadow-md">
                        Explora bandas, usuarios y vacantes en nuestra plataforma musical
                    </p>
                </div>

                

                {/* Filtros */}
                <div className=" backdrop-blur-sm rounded-2xl">
                    <Filter
                        allItems={allItems}
                        onFilterResults={handleFilterResults}
                    />
                </div>

                {/* Cards */}
                <div className=" backdrop-blur-sm rounded-2xl">
                    <div className="min-h-96">
                        {paginationData.paginatedItems.length > 0 ? (
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginationData.paginatedItems.map((item: ProductCardProps) => (
                                    <ProductCard
                                        key={item.id}
                                        {...item}
                                        onClick={() => handleItemClick(item)} // ✅ Redirigir al hacer clic
                                    />
                                ))}
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">😔</div>
                                    <p className="text-oscuro1 text-lg mb-2 font-bold">
                                        No se encontraron resultados
                                    </p>
                                    <p className="text-oscuro2 text-sm font-medium">
                                        Intenta ajustar los filtros de búsqueda
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📄</div>
                                    <p className="text-oscuro1 text-lg font-bold">
                                        No hay elementos en esta página
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {filteredItems.length > 0 && (
                        <div className="border-t border-tur3/20">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={paginationData.totalPages}
                                totalItems={paginationData.totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}