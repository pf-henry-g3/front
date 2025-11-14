"use client"

import { useState, useMemo, useEffect } from "react";
import Searchbar from "./Searchbar";

// Importar la interfaz IProductCardProps
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

interface FilterProps {
  allItems: ProductCardProps[];
  onFilterResults: (filteredItems: ProductCardProps[]) => void;
}

type FilterType = "all" | "band" | "user" | "vacancy";

export default function Filter({ allItems, onFilterResults }: FilterProps) {
  const [selectedType, setSelectedType] = useState<FilterType>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // useEffect para manejar la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para filtrar los elementos
  const filterItems = useMemo(() => {
    let filtered = allItems;

    // Filtrar por tipo si no es "all"
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.city && item.city.toLowerCase().includes(searchLower)) ||
        (item.country && item.country.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [allItems, selectedType, searchText]);

  // Efecto para enviar resultados filtrados al componente padre
  useEffect(() => {
    onFilterResults(filterItems);
  }, [filterItems, onFilterResults]);

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedType("all");
    setSearchText("");
  };

  // Obtener conteos por tipo
  const counts = useMemo(() => {
    const bandCount = allItems.filter(item => item.type === "band").length;
    const userCount = allItems.filter(item => item.type === "user").length;
    const vacancyCount = allItems.filter(item => item.type === "vacancy").length;
    
    return {
      total: allItems.length,
      bands: bandCount,
      users: userCount,
      vacancies: vacancyCount,
      filtered: filterItems.length
    };
  }, [allItems, filterItems]);

  // No renderizar hasta que el componente esté montado (evita hydration mismatch)
  if (!mounted) {
    return (
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-11 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-11 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      
      {/* ✅ Sección 1: Búsqueda (separada) */}
      <div className="p-5 backdrop-blur-sm rounded-xl">
        <Searchbar
          placeholder="Buscar por nombre, descripción, ciudad..."
          label="Búsqueda"
          value={searchText}
          onSearchChange={setSearchText}
        />
      </div>

      {/* Sección 2: Filtros por tipo (separada) */}
      <div className=" backdrop-blur-sm rounded-xl">
        {/* <label className="block text-sm font-semibold text-white mb-4">
          {/* Filtrar por tipo */}
        {/* </label> */} 
        
        <div className="flex flex-wrap gap-3 justify-center">
          {/* Botón: Todos */}
          <button
            onClick={() => setSelectedType("all")}
            className={` px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md ${
              selectedType === "all"
                ? "bg-gradient-to-r from-tur2 to-tur1 text-azul border-2 border-tur3 shadow-lg scale-105"
                : "bg-white/90 text-oscuro1 border-2 border-tur3/30 hover:border-tur3/60 hover:bg-white"
            }`}
          >
            <span className="mr-2"></span>
            Todos
            <span className="ml-2 px-2 py-0.5 bg-azul/20 rounded-full text-xs">
              {counts.total}
            </span>
          </button>

          {/* Botón: Bandas */}
          <button
            onClick={() => setSelectedType("band")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md ${
              selectedType === "band"
                ? "bg-gradient-to-r from-tur2 to-tur1 text-azul border-2 border-tur3 shadow-lg scale-105"
                : "bg-white/90 text-oscuro1 border-2 border-tur3/30 hover:border-tur3/60 hover:bg-white"
            }`}
          >
            <span className="mr-2"></span>
            Bandas
            <span className="ml-2 px-2 py-0.5 bg-azul/20 rounded-full text-xs">
              {counts.bands}
            </span>
          </button>

          {/* Botón: Artistas */}
          <button
            onClick={() => setSelectedType("user")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md ${
              selectedType === "user"
                ? "bg-gradient-to-r from-tur2 to-tur1 text-azul border-2 border-tur3 shadow-lg scale-105"
                : "bg-white/90 text-oscuro1 border-2 border-tur3/30 hover:border-tur3/60 hover:bg-white"
            }`}
          >
            <span className="mr-2"></span>
            Artistas
            <span className="ml-2 px-2 py-0.5 bg-azul/20 rounded-full text-xs">
              {counts.users}
            </span>
          </button>

          {/* Botón: Vacantes */}
          <button
            onClick={() => setSelectedType("vacancy")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md ${
              selectedType === "vacancy"
                ? "bg-gradient-to-r from-tur2 to-tur1 text-azul border-2 border-tur3 shadow-lg scale-105"
                : "bg-white/90 text-oscuro1 border-2 border-tur3/30 hover:border-tur3/60 hover:bg-white"
            }`}
          >
            <span className="mr-2"></span>
            Vacantes
            <span className="ml-2 px-2 py-0.5 bg-azul/20 rounded-full text-xs">
              {counts.vacancies}
            </span>
          </button>
        </div>

        {/* Resultados y botón limpiar (dentro de la sección de filtros) */}
        {(selectedType !== "all" || searchText) && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-tur3/30">
            <p className="text-sm text-oscuro2 font-medium">
              Mostrando <span className="font-bold text-tur1">{counts.filtered}</span> de <span className="font-bold text-oscuro1">{counts.total}</span> resultados
            </p>
            <button
              onClick={clearFilters}
              
              className="px-4 py-2 text-sm bg-linear-to-r from-tur2/80 to-tur1/80 hover:from-tur2 hover:to-tur1 text-azul font-semibold rounded-lg transition-all duration-300 border border-tur3/30 shadow-sm hover:shadow-md backdrop-blur-sm transform hover:scale-105"
              title="Limpiar todos los filtros"
            >
              <span className="mr-1"></span>
              Limpiar filtros
            </button>
          </div>
          )}
      </div>

    </div>  
  );
}