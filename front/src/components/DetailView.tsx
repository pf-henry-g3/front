/* eslint-disable @next/next/no-img-element */
"use client"

interface ProductCardProps {
    id: string;
    name: string;
    type: "band" | "user" | "vacancy";
    description?: string;
    imageUrl?: string;
    formationYear?: number;
    city?: string;
    country?: string;
    isOpen?: boolean;
}

interface DetailViewProps {
  selectedItem: ProductCardProps | null;
}

export default function DetailView({ selectedItem }: DetailViewProps) {
  if (!selectedItem) {
    return (
<<<<<<< HEAD
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-tur3/30 p-8 max-w-2xl mx-auto">
=======
      <div className="bg-white/95 pb-28 backdrop-blur-sm rounded-2xl shadow-xl border border-tur3/30 p-8">
>>>>>>> 6142046d343e09671277b2c4d1dc6f7ea7b7fe4c
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

  const getTypeIcon = () => {
    switch (selectedItem.type) {
      case 'band': return '🎵';
      case 'user': return '👤';
      case 'vacancy': return '💼';
      default: return '📋';
    }
  };

  const getTypeTitle = () => {
    switch (selectedItem.type) {
      case 'band': return 'Banda';
      case 'user': return 'Músico';
      case 'vacancy': return 'Vacante';
      default: return 'Elemento';
    }
  };

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
    <div className="flex flex-col w-full max-w-2xl p-6 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl border border-tur3/30 mx-auto">
      {/* ✅ Imagen más grande */}
      <div className="flex justify-center mb-4">
        <img
          className="w-full h-72 rounded-xl border-4 border-tur3/40 object-cover shadow-2xl"
          src={selectedItem.imageUrl || "/default-image.jpg"}
          alt={selectedItem.name}
        />
      </div>

      {/* Información del elemento */}
      <div className="flex-1">
        <div className="bg-tur1/20 rounded-xl shadow-lg p-5 border border-tur3/30">
          {/* Encabezado con tipo e icono */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">{getTypeIcon()}</div>
            <span className="inline-block bg-tur1 text-azul text-sm font-semibold px-5 py-2 rounded-full mb-3 shadow-md">
              {getTypeTitle()}
            </span>
            <h1 className="text-oscuro1 font-bold text-3xl drop-shadow-md">
              {selectedItem.name}
            </h1>
          </div>

          <div className="space-y-4">
            {/* Información específica del tipo */}
            {getTypeSpecificInfo() && (
              <div className="text-center p-3 bg-tur2/30 rounded-xl border border-tur3/20">
                <p className="text-oscuro1 text-base font-semibold">
                  {getTypeSpecificInfo()}
                </p>
              </div>
            )}
            
            {/* Descripción */}
            <div className="border-t border-tur3/30 pt-4">
              <h3 className="font-bold text-oscuro1 mb-3 text-center text-lg">
                {selectedItem.type === 'band' ? 'Descripción de la banda:' :
                 selectedItem.type === 'user' ? 'Sobre este músico:' :
                 selectedItem.type === 'vacancy' ? 'Descripción de la vacante:' :
                 'Descripción:'}
              </h3>
              <div className="bg-white/85 backdrop-blur-sm p-5 rounded-xl max-h-48 overflow-y-auto border-2 border-tur3/30 shadow-sm">
                <p className="text-oscuro1 text-base leading-relaxed text-justify font-medium">
                  {selectedItem.description || "No hay descripción disponible"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}