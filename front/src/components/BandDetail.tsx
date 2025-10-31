/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react";
import { bandMockData } from "../mocks/BandMock";

// Props simplificadas - solo necesitamos un ID opcional
interface BandDetailProps {
  selectedBandId?: number;
}

export default function BandDetail({ selectedBandId }: BandDetailProps) {
  // Estado interno para manejar qué banda mostrar
  const [currentBandIndex, setCurrentBandIndex] = useState(0);
  
  // Si hay un ID seleccionado, buscar esa banda, sino usar el índice actual
  const displayBand = selectedBandId 
    ? bandMockData.find(band => band.id === selectedBandId) || bandMockData[0]
    : bandMockData[currentBandIndex];



  return (
    <div className="flex flex-col w-full h-[670px] p-4 shadow-xl bg-azul rounded-xl">
      {/* Imagen centrada arriba */}
      <div className="flex justify-center mb-4">
        <img
          className="w-160 h-85 rounded-lg border-4 border-oscuro3 object-cover shadow-lg"
          src={displayBand?.bandImage || "/default-band.jpg"}
          alt={displayBand?.name || "Banda"}
        />
      </div>

      {/* Información de la banda abajo */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 h-full">
          <h1 className="text-gray-900 font-bold text-xl mb-3 text-center">
            {displayBand?.name || "Nombre de la banda"}
          </h1>
          
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-gray-900">Formación:</span> {' '}
                {displayBand?.formationDate 
                  ? new Date(displayBand.formationDate).toLocaleDateString() 
                  : "Fecha no disponible"
                }
              </p>
            </div>

            
            
            <div className="border-t border-gray-200 pt-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Descripción:</h3>
              <p className="text-gray-800 text-sm leading-relaxed text-justify">
                {displayBand?.bandDescription || "Descripción no disponible"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  );
}