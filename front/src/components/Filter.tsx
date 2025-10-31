"use client"

import { useState, useMemo } from "react";
import Select from "react-select";
import { bandMockData } from "../mocks/BandMock";
import { IBand } from "../interfaces/IBand";

// Tipos para react-select
interface OptionType {
  value: number;
  label: string;
  band: IBand;
}

interface GroupedOption {
  label: string;
  options: OptionType[];
}

interface FilterProductProps {
  onFilterResults?: (results: IBand[]) => void;
}

export default function FilterProduct({ onFilterResults }: FilterProductProps) {
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);

  // Crear opciones agrupadas: Nombres y Categorías
  const groupedOptions: GroupedOption[] = useMemo(() => {
    // Grupo 1: Todas las bandas por nombre
    const nameOptions: OptionType[] = bandMockData.map(band => ({
      value: band.id,
      label: band.name,
      band: band
    })).sort((a, b) => a.label.localeCompare(b.label));

    // Grupo 2: Todas las categorías únicas
    const uniqueCategories = [...new Set(bandMockData.map(band => band.category))];
    const categoryOptions: OptionType[] = uniqueCategories.map(category => {
      // Para las categorías, usamos un ID especial negativo
      const categoryBands = bandMockData.filter(band => band.category === category);
      return {
        value: -Math.abs(category.length), // ID negativo para identificar categorías
        label: category,
        band: categoryBands[0] // Usamos la primera banda de esa categoría como referencia
      };
    }).sort((a, b) => a.label.localeCompare(b.label));

    return [
      {
        label: 'Nombres de Bandas',
        options: nameOptions
      },
      {
        label: 'Categorías Musicales',
        options: categoryOptions
      }
    ];
  }, []);

  // Función para manejar cambios en la selección
  const handleSelectChange = (option: OptionType | null) => {
    setSelectedOption(option);
    
    if (option) {
      if (option.value < 0) {
        // Si se selecciona una categoría (ID negativo), filtrar por esa categoría
        const selectedCategory = option.label;
        const filteredByCategory = bandMockData.filter(band => band.category === selectedCategory);
        if (onFilterResults) {
          onFilterResults(filteredByCategory);
        }
      } else {
        // Si se selecciona una banda específica (ID positivo), filtrar solo esa banda
        if (onFilterResults) {
          onFilterResults([option.band]);
        }
      }
    } else {
      // Si se limpia la selección, mostrar todas las bandas
      if (onFilterResults) {
        onFilterResults(bandMockData);
      }
    }
  };

  // Función para personalizar las etiquetas de grupo
  const formatGroupLabel = (data: any) => {
    const isNameGroup = data.label === 'Nombres de Bandas';
    const icon = isNameGroup ? '🎤' : '🎵';
    const bgColor = isNameGroup ? 'bg-green-100' : 'bg-purple-100';
    const textColor = isNameGroup ? 'text-green-800' : 'text-purple-800';
    const titleColor = isNameGroup ? 'text-green-600' : 'text-purple-600';
    
    return (
      <div className="flex justify-between items-center py-1">
        <span className={`font-semibold ${titleColor}`}>
          {icon} {data.label}
        </span>
        <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded-full`}>
          {data.options.length} {isNameGroup ? 'banda' : 'categoría'}{data.options.length !== 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  // Estilos personalizados para react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '48px',
      borderRadius: '8px',
      border: `2px solid ${state.isFocused ? '#3b82f6' : '#e5e7eb'}`,
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        border: '2px solid #60a5fa',
      },
      transition: 'all 0.2s ease',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '14px',
    }),
    groupHeading: (provided: any) => ({
      ...provided,
      backgroundColor: 'transparent',
      color: '#374151',
      fontWeight: '600',
      fontSize: '12px',
      padding: '8px 12px',
      margin: 0,
      borderBottom: '1px solid #e5e7eb',
    }),
    option: (provided: any, state: any) => {
      const isCategory = state.data?.value < 0;
      return {
        ...provided,
        backgroundColor: state.isFocused 
          ? (isCategory ? '#f3e8ff' : '#dbeafe')
          : state.isSelected 
            ? (isCategory ? '#7c3aed' : '#3b82f6')
            : 'white',
        color: state.isSelected ? 'white' : '#374151',
        padding: '10px 12px',
        cursor: 'pointer',
        paddingLeft: isCategory ? '20px' : '16px',
        fontWeight: isCategory ? '500' : '400',
        borderLeft: isCategory ? '3px solid #7c3aed' : 'none',
        '&:hover': {
          backgroundColor: state.isSelected 
            ? (isCategory ? '#7c3aed' : '#3b82f6')
            : (isCategory ? '#f3e8ff' : '#dbeafe'),
          color: state.isSelected ? 'white' : '#374151',
        }
      };
    },
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: '300px',
      overflowY: 'auto',
    }),
  };

  return (
    <div className="py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Buscar banda por categoría
          </label>
          <Select<OptionType>
            value={selectedOption}
            onChange={handleSelectChange}
            options={groupedOptions}
            styles={customStyles}
            formatGroupLabel={formatGroupLabel}
            placeholder="🔍 Buscar banda por nombre o categoría..."
            isClearable
            isSearchable
            noOptionsMessage={() => "❌ No se encontraron bandas"}
            loadingMessage={() => "⏳ Cargando bandas..."}
            classNamePrefix="react-select"
          />
        </div>
        
        {/* Información adicional */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {bandMockData.length} bandas • {[...new Set(bandMockData.map(band => band.category))].length} categorías disponibles
          </p>
          {selectedOption && (
            <p className="text-xs text-blue-600 mt-1">
              {selectedOption.value < 0 
                ? `Filtrando por categoría: "${selectedOption.label}"` 
                : `Banda seleccionada: "${selectedOption.label}"`
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}