"use client"

import { useState, useEffect } from "react";

interface SearchbarProps {
  placeholder?: string;
  label?: string;
  value?: string;
  onSearchChange: (searchText: string) => void;
  className?: string;
}

export default function Searchbar({ 
  placeholder = "Escribe para buscar...", 
  label = "Buscar por nombre o descripción",
  value = "",
  onSearchChange,
  className = ""
}: SearchbarProps) {
  const [searchText, setSearchText] = useState<string>(value);

  // Sincronizar con el valor externo si cambia
  useEffect(() => {
    setSearchText(value);
  }, [value]);

  // Manejar cambios en el input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchText(newValue);
    onSearchChange(newValue);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchText("");
    onSearchChange("");
  };

  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-white mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 text-sm text-oscuro1 bg-white/95 backdrop-blur-sm border-2 border-tur3/40 rounded-lg focus:border-tur1 focus:outline-none focus:ring-2 focus:ring-tur1/30 transition-all duration-300 shadow-sm hover:shadow-md placeholder-oscuro3 font-medium"
        />
        
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {searchText ? (
            <button
              onClick={clearSearch}
              className="text-oscuro2 hover:text-tur1 focus:outline-none p-0.5 rounded-full hover:bg-tur1/20 transition-all duration-200"
              title="Limpiar búsqueda"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <svg className="w-3.5 h-3.5 text-oscuro2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Indicador de búsqueda activa - más compacto */}
      {searchText && (
        <div className="mt-1 text-xs text-tur1 bg-tur1/15 rounded-md px-2 py-0.5 border border-tur3/30">
          🔍 "<span className="font-semibold text-oscuro1">{searchText}</span>"
        </div>
      )}
    </div>
  );
} 