"use client"
import { useState } from "react";
import { mockData } from "../mocks/Product";
import Searchbar from "./Searchbar";


export default function FilterProduct () {
    const [searchResults, setSearchResults] = useState(mockData);
    const [isSearching, setIsSearching] = useState(false);
    
        const handleSearch = (query: string) => {
            setIsSearching(true);
            
            // Simular un delay de búsqueda (como si fuera una API)
            setTimeout(() => {
                if (query.trim() === '') {
                    setSearchResults(mockData);
                } else {
                    const filtered = mockData.filter(item =>
                        item.name.toLowerCase().includes(query.toLowerCase()) ||
                        item.category.toLowerCase().includes(query.toLowerCase())
                    );
                    setSearchResults(filtered);
                }
                setIsSearching(false);
            }, 300);
        };
    
        return (
                <div className="pt-20 pb-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <Searchbar 
                            onSearch={handleSearch}
                            placeholder="Buscar productos por nombre o categoría..."
                        />
                        
                        {isSearching ? (
                            <div className="text-center mt-8">
                                <p className="text-gray-500">Buscando...</p>
                            </div>
                        ) : (
                            <div className="mt-8">
                                <p className="text-gray-600 mb-4">
                                    {searchResults.length} producto{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchResults.map(item => (
                                        <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                            <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                                            <p className="text-gray-600 text-sm">{item.category}</p>
                                            <p className="text-gray-600 font-bold text-sm mt-2">{item.event}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                {searchResults.length === 0 && (
                                    <div className="text-center mt-8">
                                        <p className="text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )
        }