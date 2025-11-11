"use client"
import { config as dotenvConfig } from 'dotenv';
import { useEffect, useState, useCallback, useMemo } from "react";
import Filter from "../../components/Filter";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";
import DetailView from "../../components/DetailView";
import axios from "axios";



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
    const [allItems, setAllItems] = useState<ProductCardProps[]>([]);
    const [filteredItems, setFilteredItems] = useState<ProductCardProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    // Estado para el elemento seleccionado
    const [selectedItem, setSelectedItem] = useState<ProductCardProps | null>(null);

    // Función para cargar datos del backend
    const loadDataFromBackend = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Iniciando carga de datos del backend...');
            console.log('🌐 API URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

            // Cargar datos directamente de los endpoints individuales (sin búsqueda)
            console.log('📥 Cargando todos los datos automáticamente...');

            const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
            const [bandResponse, userResponse, vacancyResponse] = await Promise.all([
                axios.get(`${apiBase}/band`),
                axios.get(`${apiBase}/user`),
                axios.get(`${apiBase}/vacancy`)
            ]);

            console.log('📊 Respuestas de endpoints individuales:', {
                bandsStatus: bandResponse.status,
                bandsCount: bandResponse.data?.data?.length || (Array.isArray(bandResponse.data) ? bandResponse.data.length : 0),
                usersStatus: userResponse.status,
                usersCount: userResponse.data?.data?.length || (Array.isArray(userResponse.data) ? userResponse.data.length : 0),
                vacanciesStatus: vacancyResponse.status,
                vacanciesCount: vacancyResponse.data?.data?.length || (Array.isArray(vacancyResponse.data) ? vacancyResponse.data.length : 0)
            });

            // Extraer datos - algunos endpoints pueden devolver { success, data } otros directamente el array
            const rawBandsData = bandResponse.data?.data || bandResponse.data || [];
            const rawUsersData = userResponse.data?.data || userResponse.data || [];
            const rawVacanciesData = vacancyResponse.data?.data || vacancyResponse.data || [];

            console.log('📋 Datos extraídos:', {
                bandsRaw: Array.isArray(rawBandsData) ? rawBandsData.length : 0,
                usersRaw: Array.isArray(rawUsersData) ? rawUsersData.length : 0,
                vacanciesRaw: Array.isArray(rawVacanciesData) ? rawVacanciesData.length : 0
            });

            // Convertir bandas al formato ProductCardProps
            const bands: ProductCardProps[] = Array.isArray(rawBandsData) ? rawBandsData.map((band: any, index: number) => {
                console.log(`🎵 Procesando banda ${index + 1}:`, band);
                return {
                    id: band.id?.toString() || `band-${Math.random()}`,
                    name: band.bandName || band.name || "Banda sin nombre",
                    type: "band" as const,
                    description: band.bandDescription || band.description || "Sin descripción",
                    imageUrl: band.urlImage || "/default-band.jpg",
                    formationYear: band.formationDate ? new Date(band.formationDate).getFullYear() : undefined
                };
            }) : [];

            // Convertir usuarios al formato ProductCardProps
            const users: ProductCardProps[] = Array.isArray(rawUsersData) ? rawUsersData.map((user: any, index: number) => {
                console.log(`👤 Procesando usuario ${index + 1}:`, user);
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

            // Convertir vacantes al formato ProductCardProps
            const vacancies: ProductCardProps[] = Array.isArray(rawVacanciesData) ? rawVacanciesData.map((vacancy: any, index: number) => {
                console.log(`💼 Procesando vacante ${index + 1}:`, vacancy);
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

            console.log('✅ Bandas convertidas:', bands.length, bands);
            console.log('✅ Usuarios convertidos:', users.length, users);
            console.log('✅ Vacantes convertidas:', vacancies.length, vacancies);

            // Combinar todos los elementos
            const combinedData = [...bands, ...users, ...vacancies];
            console.log('🎯 Datos combinados finales:', combinedData.length, combinedData);

            setAllItems(combinedData);
            setFilteredItems(combinedData);

        } catch (err) {
            console.error('Error loading data:', err);
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
    const handleItemSelect = useCallback((item: ProductCardProps) => {
        setSelectedItem(item);
    }, []);

    // Función de debugging para probar diferentes endpoints
    const debugSingleCall = async () => {
        try {
            console.log('🔍 DEBUG: Iniciando diagnóstico completo...');

            // Probar el endpoint de search con diferentes términos
            const searchTests = ['Arctic', 'e', 'o', 'a', 'banda', 'música', 'usuarios', 'vacantes'];

            for (const term of searchTests) {
                try {
                    console.log(`🔍 Probando búsqueda con término: "${term}"`);
                    const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
                    const response = await axios.get(`${base}/search/global?q=${term}&limit=100`);
                    console.log(`✅ Respuesta para "${term}":`, {
                        status: response.status,
                        dataLength: response.data?.data?.length || 0,
                        meta: response.data?.meta,
                        hasData: !!response.data?.data?.length
                    });

                    if (response.data?.data?.length > 0) {
                        console.log(`🎯 ¡Encontrados datos con "${term}"!`, response.data.data[0]);
                        break; // Si encontramos datos, paramos aquí
                    }
                } catch (error) {
                    console.error(`❌ Error con término "${term}":`, error);
                }
            }

            // Probar endpoints individuales para ver si hay datos
            console.log('🔍 Probando endpoints individuales...');

            try {
                const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
                const bandResponse = await axios.get(`${base}/band`);
                console.log('🎵 Endpoint /band:', {
                    status: bandResponse.status,
                    dataLength: Array.isArray(bandResponse.data?.data) ? bandResponse.data.data.length :
                        Array.isArray(bandResponse.data) ? bandResponse.data.length : 'No es array',
                    hasData: !!(bandResponse.data?.data?.length || bandResponse.data?.length)
                });
            } catch (error) {
                console.error('❌ Error en /band:', error);
            }

            try {
                const userResponse = await axios.get(`${base}/user`);
                console.log('👤 Endpoint /user:', {
                    status: userResponse.status,
                    dataLength: Array.isArray(userResponse.data?.data) ? userResponse.data.data.length :
                        Array.isArray(userResponse.data) ? userResponse.data.length : 'No es array',
                    hasData: !!(userResponse.data?.data?.length || userResponse.data?.length)
                });
            } catch (error) {
                console.error('❌ Error en /user:', error);
            }

            try {
                const vacancyResponse = await axios.get(`${base}/vacancy`);
                console.log('💼 Endpoint /vacancy:', {
                    status: vacancyResponse.status,
                    dataLength: Array.isArray(vacancyResponse.data?.data) ? vacancyResponse.data.data.length :
                        Array.isArray(vacancyResponse.data) ? vacancyResponse.data.length : 'No es array',
                    hasData: !!(vacancyResponse.data?.data?.length || vacancyResponse.data?.length)
                });
            } catch (error) {
                console.error('❌ Error en /vacancy:', error);
            }

        } catch (error) {
            console.error('🔍 DEBUG Error general:', error);
        }
    };

    // Mostrar loading
    if (loading) {
        return (
            <div className="min-h-screen bg-azul py-8 px-4 flex justify-center items-center">
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
            <div className="min-h-screen bg-azul py-8 px-4 flex justify-center items-center">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md">
                    <h2 className="text-red-700 text-xl font-bold mb-2">❌ Error</h2>
                    <p className="text-oscuro2 mb-6 font-medium">{error}</p>
                    <button
                        onClick={loadDataFromBackend}
                        className="px-6 py-3 bg-gradient-to-r from-tur2 to-tur1 text-azul font-bold rounded-xl hover:from-tur1 hover:to-tur2 transition-all duration-300 shadow-lg transform hover:scale-105"
                    >
                        🔄 Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-azul py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Título principal con estilo del landing - Añadimos padding top para evitar navbar */}
                <div className="text-center mb-8 pt-16">
                    <h1 className="text-white text-4xl font-bold mb-2 drop-shadow-lg">
                        Bienvenidos a Home
                    </h1>
                    <p className="text-white/90 text-lg font-medium drop-shadow-md">
                        Explora bandas, usuarios y vacantes en nuestra plataforma musical
                    </p>
                </div>

                {/* Layout principal con estilos del landing */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Panel izquierdo - Filtros y Cards */}
                    <div className="lg:w-2/5 flex flex-col space-y-4">
                        {/* Componente Filter con estilo del landing */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-tur3/30">
                            <Filter
                                allItems={allItems}
                                onFilterResults={handleFilterResults}
                            />
                        </div>

                        {/* Cards de resultados paginados */}
                        <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-tur3/30 overflow-hidden">
                            {/* Contenedor de cards */}
                            <div className="min-h-96">
                                {paginationData.paginatedItems.length > 0 ? (
                                    <div className="p-4 space-y-3">
                                        {paginationData.paginatedItems.map((item: ProductCardProps) => (
                                            <ProductCard
                                                key={item.id}
                                                {...item}
                                                isSelected={selectedItem?.id === item.id}
                                                onClick={() => handleItemSelect(item)}
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

                            {/* Componente de paginación */}
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

                    {/* Panel derecho - Vista de detalles con estilo del landing */}
                    <div className="lg:w-3/5 flex items-start justify-center">
                        <div className="w-full max-w-2xl">
                            <DetailView selectedItem={selectedItem} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}