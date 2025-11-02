// Interface para un item individual de la respuesta del API
export interface GlobalSearchResult {
    id: string;
    name: string;
    type: "band" | "user" | "vacancy";
    urlImage?: string;
    description?: string;
    formationDate?: string; // Como string desde el API (formato: "YYYY-MM-DD")
    // Propiedades específicas para diferentes tipos
    birthDate?: string; // Para users
    averageRating?: number;
    city?: string;
    country?: string;
    requireEntityType?: string; // Para vacancies
    ownerId?: string;
    isOpen?: boolean;
    leaderId?: string; // Para bands
}

// Interface para la respuesta completa del API
export interface GlobalSearchResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
    };
    data: GlobalSearchResult[];
}

// Interface para los parámetros de búsqueda
export interface SearchParams {
    query?: string;
    page?: number;
    limit?: number;
    type?: "band" | "user" | "vacancy";
}