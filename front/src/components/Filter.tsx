"use client"

import { useState, useMemo, useEffect } from "react";
import Select from "react-select";
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

// Tipos para react-select
interface FilterOptionType {
  value: string;
  label: string;
  type: "all" | "band" | "user" | "vacancy";
}

interface FilterProps {
  allItems: ProductCardProps[];
  onFilterResults: (filteredItems: ProductCardProps[]) => void;
}

export default function Filter({ allItems, onFilterResults }: FilterProps) {
  const [selectedType, setSelectedType] = useState<FilterOptionType | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // useEffect para manejar la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Opciones de filtro por tipo
  const typeOptions: FilterOptionType[] = useMemo(() => [
    { value: "all", label: "🌟 Todos los tipos", type: "all" },
    { value: "band", label: "🎵 Bandas", type: "band" },
    { value: "user", label: "👤 Usuarios", type: "user" },
    { value: "vacancy", label: "💼 Vacantes", type: "vacancy" }
  ], []);

  // Función para filtrar los elementos
  const filterItems = useMemo(() => {
    let filtered = allItems;

    // Filtrar por tipo si hay uno seleccionado
    if (selectedType && selectedType.type !== "all") {
      filtered = filtered.filter(item => item.type === selectedType.type);
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

  // Función para manejar cambios en la selección de tipo
  const handleTypeChange = (option: FilterOptionType | null) => {
    setSelectedType(option);
  };



  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedType(null);
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

  // Estilos personalizados para react-select con tema del landing - más compacto
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '36px',
      borderRadius: '10px',
      border: `2px solid ${state.isFocused ? 'var(--color-tur1)' : 'rgba(var(--color-tur3-rgb), 0.4)'}`,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(4px)',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(var(--color-tur1-rgb), 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        border: '2px solid rgba(var(--color-tur1-rgb), 0.7)',
      },
      transition: 'all 0.3s ease',
      fontSize: '13px',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'var(--color-oscuro3)',
      fontSize: '14px',
      fontWeight: '500',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused 
        ? 'rgba(var(--color-tur1-rgb), 0.2)'
        : state.isSelected 
          ? 'var(--color-tur1)'
          : 'white',
      color: state.isSelected ? 'var(--color-azul)' : 'var(--color-oscuro1)',
      padding: '10px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: state.isSelected ? '600' : '500',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--color-tur1)' : 'rgba(var(--color-tur1-rgb), 0.2)',
        color: state.isSelected ? 'var(--color-azul)' : 'var(--color-oscuro1)',
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '2px solid rgba(var(--color-tur3-rgb), 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999, // Z-index alto para aparecer por encima de otros elementos
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999, // También para el portal si se usa
    }),
  };

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
    <div className="mb-3 p-4 bg-gradient-to-r from-white/85 to-white/75 backdrop-blur-sm rounded-xl shadow-lg border border-tur3/30 relative z-10">
      
      {/* Layout vertical reorganizado */}
      <div className="flex flex-col gap-3">
        {/* Fila de inputs - layout horizontal balanceado */}
        <div className="flex items-end gap-6">
          {/* Búsqueda por texto */}
          <div className="flex-1 max-w-xs">
            <Searchbar
              placeholder="Buscar por nombre..."
              label="Búsqueda"
              value={searchText}
              onSearchChange={setSearchText}
              className=""
            />
          </div>

          {/* Filtro por tipo */}
          <div className="w-52">
            <label className="block text-xs font-semibold text-oscuro1 mb-1">
              Filtrar por tipo
            </label>
            <Select<FilterOptionType>
              value={selectedType}
              onChange={handleTypeChange}
              options={typeOptions}
              styles={customStyles}
              placeholder="Seleccionar tipo..."
              isClearable
              isSearchable={false}
              noOptionsMessage={() => "No hay opciones"}
              menuPortalTarget={mounted ? document.body : null}
              menuPlacement="bottom"
              menuShouldScrollIntoView={false}
            />
          </div>
        </div>

        {/* Fila inferior: Solo botón limpiar */}
        {(selectedType || searchText) && (
          <div className="flex justify-center mt-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm bg-gradient-to-r from-tur2/80 to-tur1/80 hover:from-tur2 hover:to-tur1 text-azul font-semibold rounded-lg transition-all duration-300 border border-tur3/30 shadow-sm hover:shadow-md backdrop-blur-sm transform hover:scale-105"
              title="Limpiar todos los filtros"
            >
              ✨ Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}