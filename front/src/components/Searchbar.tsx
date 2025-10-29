"use client"

import { useState, ChangeEvent, FormEvent } from "react";

interface SearchbarProps {
  onSearch: (query: string) => void;
  placeholder: string;
}

export default function Searchbar ({ onSearch, placeholder = "Buscar..."}: SearchbarProps) {

    const [query, setQuery] = useState<string>('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };
    return (
        <div>
             <form 
      onSubmit={handleSubmit}
      className="flex gap-3 max-w-md mx-auto"
    >
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-full text-base outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-xl text-gray-500 cursor-pointer hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>
      <button 
        type="submit"
        className="ppy-1.5 rounded-md px-4 text-tur3 text-lg font-sans border-fondo1 transition duration-400 hover:bg-tur3 hover:border-verde hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer"
      >
        Buscar
      </button>
    </form>
        </div>
    )
} 