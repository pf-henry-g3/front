"use client";

import { useState } from "react";
import Filterproduct from "@/src/components/Filter";
import BandDetail from "@/src/components/BandDetail";
import ProductCard from "@/src/components/ProductCard";
import { bandMockData } from "@/src/mocks/BandMock";
import { IBand } from "@/src/interfaces/IBand";

export default function HomePage () {
    const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
    const [filteredBands, setFilteredBands] = useState<IBand[]>(bandMockData);

    const handleFilterResults = (results: IBand[]) => {
        setFilteredBands(results);
        setSelectedBandId(null); // Reset selección cuando se filtra
    };

    return (
        <div className="py-20 px-4 flex flex-row gap-6 max-w-7xl mx-auto">
            {/* Panel izquierdo - Cards de bandas */}
            <div className="flex flex-col w-2/5 rounded-2xl mx-1" >
                <h1 className="text-txt1 text-3xl mt-1 font-bold text-center">Búsqueda de Bandas</h1>
                
                {/* Barra de búsqueda */}
                <div className="mb-4">
                    <Filterproduct onFilterResults={handleFilterResults} />
                </div>
                
                {/* Cards de bandas - Más compactas */}
                <div className="flex-1">
                    <ProductCard 
                        onSelectBand={setSelectedBandId} 
                        filteredBands={filteredBands}
                    />
                </div>
            </div>

            {/* Panel derecho - Detalles de la banda */}
            <div className="flex-1 w-3/5">
                <BandDetail selectedBandId={selectedBandId || undefined} />
            </div>
        </div>
    ) 
}