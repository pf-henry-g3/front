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
    isOpen 
}: ProductCardProps) {
    // Función simple para obtener el texto del tipo
    const getTypeText = () => {
        if (type === 'band') return '🎵 Banda';
        if (type === 'user') return '👤 Músico';
        if (type === 'vacancy') return '📋 Vacante';
        return type;
    };

    // Función simple para obtener información extra
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
            className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                isSelected 
                    ? 'border-tur2 bg-white ring-2 ring-tur1/30 shadow-2xl transition' 
                    : 'border-white/95 hover:border-white/55 hover:bg-white/55'
            }`}
            onClick={onClick}
        >
            {/* Layout compacto horizontal */}
            <div className="flex items-center gap-4">
                {/* Mini imagen */}
                <img 
                    src={imageUrl || '/default-image.jpg'} 
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-tur3/30 shadow-md"
                />
                
                {/* Contenido compacto */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-oscuro1 truncate drop-shadow-sm">{name}</h3>
                    <p className="text-tur2 text-sm font-semibold">{getTypeText()}</p>
                    {description && (
                        <p className="text-oscuro2 text-xs line-clamp-1 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                
                {/* Indicador de selección */}
                <div className="shrink-0">
                    {isSelected ? (
                        <div className="w-7 h-7 bg-tur1 rounded-full flex items-center justify-center shadow-lg ring-2 ring-tur1/30">
                            <span className="text-azul text-sm font-bold">✓</span>
                        </div>
                    ) : (
                        <div className="w-7 h-7 border-2 border-tur3/50 rounded-full bg-white/70 hover:border-tur1 transition-colors"></div>
                    )}
                </div>
            </div>
            
            {/* Información extra en la parte inferior */}
            <div className="mt-3 text-right">
                <span className="text-xs text-oscuro2 font-medium bg-tur2/20 px-2 py-1 rounded-full">
                    {getExtraInfo()}
                </span>
            </div>
        </div>
    );
}

