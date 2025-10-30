"use client";

import { useState, useEffect } from "react";
import { bandMockData } from "../mocks/BandMock";
import { IBand } from "../interfaces/IBand";

interface ProductCardProps {
    onSelectBand?: (bandId: number) => void;
    filteredBands?: IBand[];
}

export default function ProductCard({ onSelectBand, filteredBands = bandMockData }: ProductCardProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // 3 cards por página
    
    // Usar datos filtrados o todos los datos
    const dataToUse = filteredBands;
    
    // Calcular elementos para la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = dataToUse.slice(startIndex, endIndex);
    const totalPages = Math.ceil(dataToUse.length / itemsPerPage);
    
    // Reset página cuando cambian los datos filtrados
    useEffect(() => {
        setCurrentPage(1);
        setSelectedId(null);
    }, [filteredBands]);

    const handleCardClick = (id: number) => {
        setSelectedId(id);
        if (onSelectBand) {
            onSelectBand(id);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        setSelectedId(null); // Reset selección al cambiar página
    };

    return (
        <div className="h-[400px] flex flex-col space-y-4">
            {/* Mostrar mensaje si no hay resultados */}
            {dataToUse.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500 text-lg">No se encontraron bandas</p>
                        <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Grid de cards compactas - Solo 3 por página */}
                    <div className="grid grid-cols-1 gap-3 flex-1">
                {currentItems.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => handleCardClick(item.id)}
                        className={`bg-white rounded-lg shadow-sm p-3 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedId === item.id 
                                ? 'border-tur1 bg-tur1/5 ring-1 ring-tur1/20' 
                                : 'border-gray-200 hover:border-tur1/50'
                        }`}
                    >
                        {/* Layout compacto horizontal */}
                        <div className="flex items-center gap-3">
                            {/* Mini imagen */}
                            <img 
                                src={item.bandImage} 
                                alt={item.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0"
                            />
                            
                            {/* Contenido compacto */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base text-gray-900 truncate">{item.name}</h3>
                                <p className="text-blue-600 text-xs font-medium">{item.category}</p>
                                <p className="text-gray-700 text-xs line-clamp-1 mt-1">
                                    {item.bandDescription}
                                </p>
                            </div>
                            
                            {/* Indicador de selección */}
                            <div className="shrink-0">
                                {selectedId === item.id ? (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                                )}
                            </div>
                        </div>
                        
                        {/* Año en la parte inferior */}
                        <div className="mt-2 text-right">
                            <span className="text-xs text-gray-600">
                                {new Date(item.formationDate).getFullYear()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controles de paginado */}
            <div className="flex flex-col items-center space-y-2 mt-auto">
                {/* Info de página */}
                <p className="text-xs text-gray-800">
                    Página {currentPage} de {totalPages} ({dataToUse.length} bandas total)
                </p>

                {/* Botones de navegación */}
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                            currentPage === 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        ←
                    </button>

                    {/* Números de página */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${
                                currentPage === page
                                    ? 'bg-blue-500 text-white ring-1 ring-blue-300'
                                    : 'bg-white text-gray-800 border border-gray-400 hover:bg-blue-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                            currentPage === totalPages
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        →
                    </button>
                </div>
            </div>
            </>
            )}
        </div>
    );
}

