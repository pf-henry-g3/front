/* eslint-disable @next/next/no-img-element */
"use client"

interface ProductCardProps {
    id: string;
    name: string;
    type: "band" | "user" | "vacancy";
    description?: string;
    imageUrl?: string;
    formationYear?: number;  // Para bandas
    city?: string;          // Para usuarios y vacantes
    country?: string;       // Para usuarios y vacantes
    isOpen?: boolean;       // Para vacantes
}

interface DetailViewProps {
  selectedItem: ProductCardProps | null;
}

export default function DetailView({ selectedItem }: DetailViewProps) {
  if (!selectedItem) {
    // Vista por defecto cuando no hay nada seleccionado
    return (
      <div className="bg-white/95 pb-28 backdrop-blur-sm rounded-2xl shadow-xl border border-tur3/30 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-oscuro1 mb-4 drop-shadow-md">
            📊 Directorio Universal
          </h2>
          <p className="text-oscuro2 mb-8 text-lg font-medium">
            Explora bandas, usuarios y vacantes disponibles en nuestra plataforma musical.
          </p>
          
          <div className="py-16">
            <div className="text-8xl mb-6 animate-pulse">👈</div>
            <div className="bg-tur1/20 rounded-xl p-6 border border-tur3/20">
              <p className="text-oscuro1 text-xl mb-3 font-semibold">
                Selecciona un elemento
              </p>
              <p className="text-oscuro2 text-base">
                Haz click en cualquier ProductCard para ver información detallada
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Función para obtener el icono según el tipo
  const getTypeIcon = () => {
    switch (selectedItem.type) {
      case 'band': return '🎵';
      case 'user': return '👤';
      case 'vacancy': return '💼';
      default: return '📋';
    }
  };

  // Función para obtener el título del tipo
  const getTypeTitle = () => {
    switch (selectedItem.type) {
      case 'band': return 'Banda';
      case 'user': return 'Músico';
      case 'vacancy': return 'Vacante';
      default: return 'Elemento';
    }
  };

  // Función para obtener información específica del tipo
  const getTypeSpecificInfo = () => {
    if (selectedItem.type === 'band' && selectedItem.formationYear) {
      return `Año de formación: ${selectedItem.formationYear}`;
    }
    if ((selectedItem.type === 'user' || selectedItem.type === 'vacancy') && selectedItem.city) {
      return `Ubicación: ${selectedItem.city}${selectedItem.country ? `, ${selectedItem.country}` : ''}`;
    }
    if (selectedItem.type === 'vacancy' && selectedItem.isOpen !== undefined) {
      return `Estado: ${selectedItem.isOpen ? '✅ Abierta' : '❌ Cerrada'}`;
    }
    return null;
  };

  return (
    <div className="flex flex-col w-full max-h-[700px] p-6 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl border border-tur3/30 mx-auto">
      {/* Imagen centrada arriba - más compacta */}
      <div className="flex justify-center mb-3">
        <img
          className="w-48 h-32 rounded-lg border-4 border-gray-300 object-cover shadow-lg"
          src={selectedItem.imageUrl || "/default-image.jpg"}
          alt={selectedItem.name}
        />
      </div>

      {/* Información del elemento abajo */}
      <div className="flex-1">
        <div className="bg-tur1/20 rounded-xl shadow-lg p-4 border border-tur3/30 h-full">
          {/* Encabezado con tipo e icono */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-3">{getTypeIcon()}</div>
            <span className="inline-block bg-tur1 text-azul text-sm font-semibold px-4 py-1.5 rounded-full mb-3 shadow-md">
              {getTypeTitle()}
            </span>
            <h1 className="text-oscuro1 font-bold text-2xl drop-shadow-md">
              {selectedItem.name}
            </h1>
          </div>

          <div className="space-y-4">
            {/* Información específica del tipo */}
            {getTypeSpecificInfo() && (
              <div className="text-center p-3 bg-tur2/30 rounded-xl border border-tur3/20">
                <p className="text-oscuro1 text-sm font-semibold">
                  {getTypeSpecificInfo()}
                </p>
              </div>
            )}
            
            {/* Descripción - sin scroll */}
            <div className="border-t border-tur3/30 pt-4">
              <h3 className="font-bold text-oscuro1 mb-3 text-center text-base">
                {selectedItem.type === 'band' ? 'Descripción de la banda:' :
                 selectedItem.type === 'user' ? 'Sobre este músico:' :
                 selectedItem.type === 'vacancy' ? 'Descripción de la vacante:' :
                 'Descripción:'}
              </h3>
              <div className="bg-white/85 backdrop-blur-sm p-4 rounded-xl max-h-36 overflow-hidden border-2 border-tur3/30 shadow-sm">
                <p className="text-oscuro1 text-sm leading-relaxed text-justify font-medium">
                  {selectedItem.description || "No hay descripción disponible"}
                </p>
                {selectedItem.description && selectedItem.description.length > 200 && (
                  <div className="text-sm text-tur1 mt-2 text-center font-semibold">
                    ...
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional según el tipo - más compacta */}
            <div className="border-t border-tur3/30 pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/80 p-3 rounded-xl text-center border-2 border-tur3/30 shadow-sm">
                  <span className="font-bold text-oscuro1 block">ID:</span>
                  <p className="text-oscuro1 text-xs mt-1 font-medium">{selectedItem.id}</p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl text-center border-2 border-tur3/30 shadow-sm">
                  <span className="font-bold text-oscuro1 block">Tipo:</span>
                  <p className="text-oscuro1 text-xs mt-1 font-medium">{getTypeTitle()}</p>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}