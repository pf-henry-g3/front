"use client"

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

export default function ProductCard({ 
    id, 
    name, 
    type, 
    description, 
    imageUrl, 
    isSelected = false, 
    onClick,
    formationYear,
    city,
    country,
    isOpen,
}: ProductCardProps) {
    const getTypeText = () => {
        if (type === 'band') return '🎵 Banda';
        if (type === 'user') return '👤 Músico';
        if (type === 'vacancy') return '📋 Vacante';
        return type;
    };

    const getExtraInfo = () => {
        if (type === 'band' && formationYear) {
            return `Formada en ${formationYear}`;
        }
        if ((type === 'user' || type === 'vacancy') && city) {
            return `📍 ${city}${country ? `, ${country}` : ''}`;
        }
        if (type === 'vacancy' && isOpen !== undefined) {
            return isOpen ? '✅ Abierta' : '❌ Cerrada';
        }
        return '';
    };

    return (
        <div 
            className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                isSelected 
                    ? 'border-tur1 bg-tur1/10 ring-4 ring-tur1/30 shadow-2xl scale-[1.02]' 
                    : 'border-tur3/30 hover:border-tur1/60 hover:bg-tur2'
            }`}
            onClick={onClick}
        >
            <div className="flex flex-col">
                <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
                    <img 
                        src={imageUrl || '/default-image.jpg'} 
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                    
                    {isSelected && (
                        <div className="absolute top-3 right-3 w-10 h-10 bg-tur1 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white">
                            <span className="text-white text-lg font-bold">✓</span>
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                    <div className="mb-3">
                        <h3 className="font-bold text-lg text-oscuro1 mb-2 line-clamp-1">
                            {name}
                        </h3>
                        
                        {description && (
                            <p className="text-oscuro2 text-sm line-clamp-2 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-tur3/20 ">
                        <span className="text-sm text-oscuro2 font-medium bg-tur2/10 px-3 py-1.5 rounded-lg border border-tur2/20">
                            {getExtraInfo()}
                        </span>
                        
                        <div className="shrink-0">
                            {isSelected ? (
                                <span className="text-tur1 text-sm font-bold animate-pulse">
                                    Seleccionado
                                </span>
                            ) : (
                                <div className="w-8 h-8 border-2 border-tur3/50 rounded-full bg-white/70 hover:border-tur1 hover:bg-tur1/10 transition-all"></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}