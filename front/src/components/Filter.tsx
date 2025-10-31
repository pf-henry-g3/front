"use client"
import { useState } from "react";
import { mockData } from "../mocks/EventMock";
import Searchbar from "./Searchbar";
import { bandMockData } from "../mocks/BandMock";
import { IBand } from "../interfaces/IBand";

interface FilterProductProps {
    onFilterResults?: (results: IBand[]) => void;
}

export default function FilterProduct ({ onFilterResults }: FilterProductProps) {
    const [searchResults, setSearchResults] = useState(bandMockData);
    const [isSearching, setIsSearching] = useState(false);
    
        const handleSearch = (query: string) => {
            setIsSearching(true);
            
            // Simular un delay de búsqueda (como si fuera una API)
            setTimeout(() => {
                let filtered: IBand[];
                if (query.trim() === '') {
                    filtered = bandMockData;
                } else {
                    filtered = bandMockData.filter(item =>
                        item.name.toLowerCase().includes(query.toLowerCase()) ||
                        item.category.toLowerCase().includes(query.toLowerCase())
                    );
                }
                setSearchResults(filtered);
                
                // Pasar los resultados al componente padre
                if (onFilterResults) {
                    onFilterResults(filtered);
                }
                
                setIsSearching(false);
            }, 300);
        };
    
        return (
                <div className="py-4 px-4">
                    <div className="max-w-4xl mx-auto">
                        <Searchbar 
                            onSearch={handleSearch}
                            placeholder="Buscar bandas por nombre o categoría..."
                        />
                        
                        {isSearching && (
                            <div className="text-center mt-4">
                                <p className="text-gray-500 text-sm">Buscando...</p>
                            </div>
                        )}
                    </div>
                </div>
            )
        }